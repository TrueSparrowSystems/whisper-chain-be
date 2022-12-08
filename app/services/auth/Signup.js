/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  localCipher = require(rootPrefix + '/lib/encryptors/localCipher'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  util = require(rootPrefix + '/lib/util'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  userConstants = require(rootPrefix + '/lib/globalConstant/user/user'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

/**
 * Class for email sign up.
 *
 * @class EmailSignup
 */
class EmailSignup extends ServiceBase {
  /**
   * Constructor for email sign-up class.
   *
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.api_source
   *
   * @augments ServiceBase
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.email = params.email;
    oThis.password = params.password;
    oThis.apiSource = params.api_source;

    oThis.encryptedEncryptionSalt = null;
    oThis.individualUser = null;
    oThis.individualUserId = null;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis._validateSignUpEmail();

    await oThis._createUser();

    return oThis._prepareResponse();
  }

  /**
   * Validate sign up params
   *
   * @sets oThis.email
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validateSignUpEmail() {
    const oThis = this;

    oThis.email = oThis.email.trim().toLowerCase();

    if (!CommonValidators.isValidEmail(oThis.email)) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'a_s_a_si_vsu_1',
          api_error_identifier: 'invalid_params',
          params_error_identifiers: ['invalid_email'],
          debug_options: {}
        })
      );
    }
  }

  /**
   * Create user
   *
   * @sets oThis.individualUser, oThis.individualUserId
   *
   * @returns {Promise<void>}
   * @private
   */
  async _createUser() {
    const oThis = this;

    logger.log('Start :: Create user');

    const plainText = localCipher.generateRandomSalt();
    oThis.encryptedEncryptionSalt = localCipher.encrypt(coreConstants.ENCRYPTION_KEY, plainText);

    const cookieToken = localCipher.generateRandomIv(32),
      encryptedCookieToken = localCipher.encrypt(coreConstants.ENCRYPTION_KEY, cookieToken),
      encryptedPassword = util.createSha256Digest(plainText, oThis.password),
      name = basicHelper.getFirstNameFromEmail(oThis.email);

    let insertData = {
      email: oThis.email,
      name: name,
      password: encryptedPassword,
      cookie_token: encryptedCookieToken,
      encryption_salt: oThis.encryptedEncryptionSalt,
      properties: 0,
      status: userConstants.invertedStatuses[userConstants.activeStatus]
    };

    const insertResponse = await new UserModel().insert(insertData).fire();
    insertData.id = insertResponse.insertId;

    insertData = Object.assign(insertData, insertResponse.defaultUpdatedAttributes);

    oThis.individualUser = new UserModel().formatDbData(insertData);
    oThis.individualUserId = oThis.individualUser.id;

    await UserModel.flushCache({ id: oThis.individualUserId });

    logger.log('End :: Create user');
  }

  /**
   * Prepare response.
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _prepareResponse() {
    const oThis = this;

    const userLoginCookieValue = new UserModel().getCookieValue(oThis.individualUser, coreConstants.ENCRYPTION_KEY, {
      timestamp: Date.now() / 1000,
      apiSource: oThis.apiSource,
      currentUserId: oThis.individualUser.id
    });

    return responseHelper.successWithData({
      userLoginCookieValue: userLoginCookieValue,
      userId: oThis.individualUserId
    });
  }
}

module.exports = EmailSignup;
