const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  ReplayAttack = require(rootPrefix + '/lib/cacheManagement/single/ReplayAttackOnWebsocketAuth'),
  UserSocketConnectionDetailModel = require(rootPrefix + '/app/models/mysql/socket/UserSocketConnectionDetail'),
  UserSocketConnectionDetailsByIdsCache = require(rootPrefix +
    '/lib/cacheManagement/multi/socket/UserSocketConnectionDetailsByIds'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  base64Helper = require(rootPrefix + '/lib/base64Helper'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  localCipher = require(rootPrefix + '/lib/encryptors/localCipher'),
  configStrategy = require(rootPrefix + '/lib/providers/configStrategy'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy'),
  socketConnectionConstants = require(rootPrefix + '/lib/globalConstant/socket/socketConnection');

/**
 * Class for websocket auth.
 *
 * @class WebSocketAuth
 */
class WebSocketAuth extends ServiceBase {
  /**
   * Constructor for websocket auth.
   *
   * @param {object} params
   * @param {string} params.auth_key_expiry_at
   * @param {string} params.payload
   * @param {string} params.socketIdentifier: socketIdentifier
   *
   * @augments ServiceBase
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.authKeyExpiryAt = params.auth_key_expiry_at;
    oThis.payload = params.payload;
    oThis.socketIdentifier = params.socketIdentifier;

    oThis.salt = null;
    oThis.decryptedPayload = null;
    oThis.userSocketConnectionDetails = null;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    // This is necessary, as we don't have common param validations layer for web-socket server.
    await oThis._validateAndSanitizeParams();

    await oThis._fetchConfigData();

    await oThis._checkAuthKeyValidity();

    await oThis._decryptPayload();

    await oThis._checkForReplayAttack();

    await oThis._fetchUserSocketConnection();

    await oThis._verifyAuthKeyValidity();

    await oThis._modifySocketConnectionDetails();

    return responseHelper.successWithData({
      userId: oThis.userId,
      userSocketConnDetailsId: oThis.decryptedPayload.id,
      apiVersion: oThis.decryptedPayload.api_version
    });
  }

  /**
   * Validate and sanitize params.
   *
   * @returns {Promise<*|undefined>}
   * @private
   */
  async _validateAndSanitizeParams() {
    const oThis = this;

    // To verify the authenticity 'socketIdentifier' value.
    // Select active socketJobProcessor cron process id from cron processes table.

    if (!CommonValidators.validateNonBlankString(oThis.authKeyExpiryAt)) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_at_vasp_1',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {}
        })
      );
    }

    if (!CommonValidators.validateNonBlankString(oThis.payload)) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_at_vasp_2',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {}
        })
      );
    }
  }

  /**
   * This functions fetches config related to be used later in the file.
   *
   * @sets oThis.salt
   *
   * @returns {Promise<void>}
   * @private
   */
  async _fetchConfigData() {
    const oThis = this;

    const constantsRsp = await configStrategy.getConfigForKind(configStrategyConstants.websocket);
    if (constantsRsp.isFailure()) {
      return Promise.reject(constantsRsp);
    }

    oThis.salt = constantsRsp.data[configStrategyConstants.websocket].wsAuthSalt;
  }

  /**
   * Checks if the auth key is valid when this request was made.
   *
   * @returns {Promise<undefined|*>}
   * @private
   */
  async _checkAuthKeyValidity() {
    const oThis = this;

    if (basicHelper.isDevelopment()) {
      return;
    }
    const currentTimeStamp = basicHelper.getCurrentTimestampInSeconds();

    if (oThis.authKeyExpiryAt < currentTimeStamp) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_a_1',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {
            authKeyExpiryAt: oThis.authKeyExpiryAt,
            currentTimeStamp: currentTimeStamp
          }
        })
      );
    }
  }

  /**
   * Decrypt payload.
   *
   * @sets oThis.decryptedPayload, oThis.userId
   *
   * @returns {Promise<void>}
   * @private
   */
  async _decryptPayload() {
    const oThis = this;

    const base64DecodedPayload = base64Helper.decode(oThis.payload),
      decryptedPayload = localCipher.decrypt(oThis.salt, base64DecodedPayload);

    try {
      oThis.decryptedPayload = JSON.parse(decryptedPayload);
    } catch (err) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_a_2',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {
            err: err
          }
        })
      );
    }

    oThis.userId = oThis.decryptedPayload.user_id;
  }

  /**
   * Check replay attack.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _checkForReplayAttack() {
    const oThis = this;

    if (basicHelper.isDevelopment()) {
      return;
    }
    const replayAttackCacheResponse = await new ReplayAttack({ authKey: oThis.decryptedPayload.auth_key }).fetch();

    if (replayAttackCacheResponse.isFailure()) {
      logger.log('Replay attack detected !!');

      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_a_cfra_1',
          api_error_identifier: 'could_not_proceed',
          debug_options: {
            authKey: oThis.decryptedPayload.auth_key
          }
        })
      );
    }
  }

  /**
   * Fetch user socket connection.
   *
   * @sets oThis.userSocketConnectionDetails
   *
   * @returns {Promise<*|undefined>}
   * @private
   */
  async _fetchUserSocketConnection() {
    const oThis = this,
      userSocketConnDetailId = oThis.decryptedPayload.id;

    const cacheRsp = await new UserSocketConnectionDetailsByIdsCache({ ids: [userSocketConnDetailId] }).fetch();
    if (cacheRsp.isFailure()) {
      return Promise.reject(cacheRsp);
    }

    // Reject if the no entry is found for user id.
    if (!cacheRsp.data[userSocketConnDetailId].id) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_a_3',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {
            userId: oThis.userId,
            id: userSocketConnDetailId
          }
        })
      );
    }

    oThis.userSocketConnectionDetails = cacheRsp.data[userSocketConnDetailId];
    logger.info('userSocketConnectionDetails ==> ', oThis.userSocketConnectionDetails);
  }

  /**
   * Verify auth key validity.
   *
   * @returns {Promise<*|undefined>}
   * @private
   */
  async _verifyAuthKeyValidity() {
    const oThis = this;

    if (basicHelper.isDevelopment()) {
      return;
    }
    // If auth key is expired or auth key doesn't matches.
    if (
      oThis.authKeyExpiryAt != oThis.userSocketConnectionDetails.authKeyExpiryAt ||
      basicHelper.getCurrentTimestampInSeconds() > oThis.userSocketConnectionDetails.authKeyExpiryAt ||
      oThis.decryptedPayload.auth_key !== oThis.userSocketConnectionDetails.authKey ||
      oThis.userId != oThis.userSocketConnectionDetails.userId
    ) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_ws_a_4',
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {
            userId: oThis.userId,
            id: oThis.userSocketConnectionDetails.id
          }
        })
      );
    }
  }

  /**
   * Modify socket connection details.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _modifySocketConnectionDetails() {
    const oThis = this;

    await new UserSocketConnectionDetailModel()
      .update({
        auth_key_expiry_at: null,
        socket_identifier: oThis.socketIdentifier,
        status: socketConnectionConstants.invertedStatuses[socketConnectionConstants.connectedStatus]
      })
      .where({
        id: oThis.userSocketConnectionDetails.id
      })
      .fire();

    await UserSocketConnectionDetailModel.flushCache({
      id: oThis.userSocketConnectionDetails.id,
      userId: oThis.userSocketConnectionDetails.userId
    });
  }
}

module.exports = WebSocketAuth;
