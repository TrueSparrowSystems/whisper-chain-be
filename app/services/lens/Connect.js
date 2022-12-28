const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  localCipher = require(rootPrefix + '/lib/localCipher'),
  VerifyLensSignerAddressLib = require(rootPrefix + '/lib/VerifyLensSignerAddress'),
  ImagesModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  UsersModel = require(rootPrefix + '/app/models/mysql/main/User'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform'),
  UserEthAddressesModel = require(rootPrefix + '/app/models/mysql/main/UserEthAddresses'),
  userEthAddressesConstants = require(rootPrefix + '/lib/globalConstant/userEthAddresses'),
  userConstants = require(rootPrefix + '/lib/globalConstant/user'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for lens connect.
 *
 * @class Connect
 */
class Connect extends ServiceBase {
  /**
   * Constructor for lens connect.
   *
   * @param {object} params
   * @param {string} params.platform
   * @param {string} params.platform_profile_image_url
   * @param {string} params.platform_user_id
   * @param {string} params.platform_display_name
   * @param {string} params.platform_username
   * @param {string} params.challenge_message
   * @param {string} params.signed_challenge_message
   * @param {string} params.wallet_address
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.platformProfileImageUrl = params.platform_profile_image_url;
    oThis.platform = params.platform;
    oThis.platformUserId = params.platform_user_id;
    oThis.platformDisplayName = params.platform_display_name;
    oThis.platformUsername = params.platform_username;
    oThis.challengeMessage = params.challenge_message;
    oThis.signedChallengeMessage = params.signed_challenge_message;
    oThis.walletAddress = params.wallet_address;

    oThis.usersArr = [];
    oThis.userLoginCookie = null;
    oThis.isNewUser = false;
    oThis.user = {};
    oThis.userId = null;
    oThis.platformProfileImageId = null;
    oThis.decryptedEncryptionSalt = null;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis.verifySignature();

    await oThis.fetchUserDetails();

    if (oThis.isNewUser) {
      await oThis.createImage();
      await oThis.createUser();
      await oThis.createUserEthAddress();
    }

    return oThis._prepareResponse();
  }

  /**
   * Verify signature
   *
   */
  async verifySignature() {
    const oThis = this;
    try {
      await new VerifyLensSignerAddressLib(
        oThis.challengeMessage,
        oThis.signedChallengeMessage,
        oThis.walletAddress
      ).perform();
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: error.internal_error_identifier,
          api_error_identifier: 'unauthorized_api_request',
          debug_options: {
            error: error
          }
        })
      );
    }
  }

  /**
   * Fetch user details
   *
   */
  async fetchUserDetails() {
    const oThis = this;
    oThis.usersArr = await new UsersModel().fetchByPlatformUserId(oThis.platformUserId);

    if (oThis.usersArr.length == 0) {
      oThis.isNewUser = true;
      return;
    }

    const encryptedEncryptionSalt = coreConstants.GLOBAL_ENCRYPTED_ENCRYPTION_SALT;
    oThis.decryptedEncryptionSalt = localCipher.decrypt(coreConstants.ENCRYPTION_KEY, encryptedEncryptionSalt);
    oThis.user = oThis.usersArr[0];
    oThis.userId = oThis.user.id;
    oThis.user.uts = oThis.user.updatedAt;
  }

  /**
   * Create entry in image table
   *
   * @sets oThis.platformProfileImageIds
   */
  async createImage() {
    const oThis = this;

    const insertParams = {
      url: oThis.platformProfileImageUrl
    };

    const insertResponse = await new ImagesModel().insertRecord(insertParams);

    if (insertResponse.affectedRows !== 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_c_ci_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertParams: insertParams,
            insertResponse: insertResponse
          }
        })
      );
    }

    oThis.platformProfileImageId = insertResponse.insertId;
  }

  /**
   * Create user
   *
   * @sets oThis.user, oThis.userId
   *
   * @returns {Promise<void>}
   * @private
   */
  async createUser() {
    const oThis = this;

    console.log('Create user started....');

    // oThis.decryptedEncryptionSalt = localCipher.generateRandomSalt();
    const encryptedEncryptionSalt = coreConstants.GLOBAL_ENCRYPTED_ENCRYPTION_SALT;
    oThis.decryptedEncryptionSalt = localCipher.decrypt(coreConstants.ENCRYPTION_KEY, encryptedEncryptionSalt);

    const cookieToken = localCipher.generateRandomIv(32),
      encryptedCookieToken = localCipher.encrypt(oThis.decryptedEncryptionSalt, cookieToken);

    let insertData = {
      platform: platformConstants.invertedPlatforms[oThis.platform],
      platform_user_id: oThis.platformUserId,
      platform_display_name: oThis.platformDisplayName,
      platform_username: oThis.platformUsername,
      platform_profile_image_id: oThis.platformProfileImageId,
      kind: userConstants.invertedKinds[userConstants.externalKind],
      cookie_token: encryptedCookieToken,
      status: userConstants.invertedStatuses[userConstants.activeStatus]
    };

    const insertResponse = await new UsersModel().insertRecord(insertData);

    if (insertResponse.affectedRows !== 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_c_cu_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertData: insertData,
            insertResponse: insertResponse
          }
        })
      );
    }

    insertData.id = insertResponse.insertId;

    insertData = Object.assign(insertData, insertResponse.defaultUpdatedAttributes);

    oThis.user = new UsersModel().formatDbData(insertData);
    oThis.userId = oThis.user.id;
    oThis.user.uts = oThis.user.updatedAt;

    console.log('End :: Create user');
  }

  /**
   * Create user eth address
   *
   * @returns {Promise<void>}
   * @private
   */
  async createUserEthAddress() {
    const oThis = this;

    let insertData = {
      user_id: oThis.userId,
      eth_address: oThis.walletAddress,
      platform: platformConstants.invertedPlatforms[oThis.platform],
      eth_address_kind: userEthAddressesConstants.invertedKinds[userEthAddressesConstants.authKind]
    };

    const insertResponse = await new UserEthAddressesModel().insertRecord(insertData);

    if (insertResponse.affectedRows !== 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_c_cuea_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertData: insertData,
            insertResponse: insertResponse
          }
        })
      );
    }
  }

  /**
   * Prepare service response.
   *
   * @returns {*|result}
   * @private
   */
  _prepareResponse() {
    const oThis = this;

    const lensUserLoginCookieValue = new UsersModel().getCookieValue(oThis.user, oThis.decryptedEncryptionSalt, {
      timestamp: Date.now() / 1000
    });

    const currentUser = {
      id: oThis.user.id,
      uts: Date.now(),
      userId: oThis.userId
    };
    const userMap = {};
    userMap[oThis.userId] = oThis.user;

    return responseHelper.successWithData({
      lensUserLoginCookieValue: lensUserLoginCookieValue,
      [entityTypeConstants.currentUser]: currentUser,
      [entityTypeConstants.users]: userMap
    });
  }
}

module.exports = Connect;
