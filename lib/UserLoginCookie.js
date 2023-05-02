const rootPrefix = '..',
  UserModel = require(rootPrefix + '/app/models/mysql/main/User'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  localCipher = require(rootPrefix + '/lib/localCipher'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  userConstants = require(rootPrefix + '/lib/globalConstant/user');
/**
 * Class to validate and set user login cookie.
 *
 * @class UserAuthLoginCookie
 */
class UserAuthLoginCookie {
  /**
   * Constructor to validate and set user login cookie.
   *
   * @param {string} cookieValue
   * @param {object} options
   * @param {string} options.expiry
   * @param {object} options.internalDecodedParams
   * @param {object} options.internalDecodedParams.headers
   * @param {string} options.internalDecodedParams.api_source
   * @param {object} options.internalDecodedParams.internal_timezone
   *
   * @constructor
   */
  constructor(cookieValue, options = {}) {
    const oThis = this;

    oThis.cookieValue = cookieValue;
    oThis.cookieExpiry = options.expiry;

    oThis.userId = null;
    oThis.token = null;
    oThis.timestamp = null;

    oThis.currentUser = null;

    oThis.userLoginCookieValue = null;
    oThis.decryptedEncryptionSalt = null;
  }

  /**
   * Main performer for class.
   *
   * @return {Promise<*|result>}
   */
  async perform() {
    const oThis = this;

    await oThis._validate();

    await oThis._setParts();

    await oThis._validateTimestamp();

    await oThis._fetchAndValidateCurrentUser();

    await oThis._validateToken();

    oThis._setCookie();

    return responseHelper.successWithData({
      current_user: oThis.currentUser,
      user_login_cookie_value: oThis.userLoginCookieValue
    });
  }

  /**
   * Validate input params.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _validate() {
    const oThis = this;

    if (!CommonValidators.validateString(oThis.cookieValue)) {
      return oThis._unauthorizedResponse('l_ulc_v_1');
    }

    if (!CommonValidators.validateNonZeroInteger(oThis.cookieExpiry)) {
      return oThis._unauthorizedResponse('l_ulc_v_2');
    }
  }

  /**
   * Set cookie parts.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _setParts() {
    const oThis = this;

    const cookieValueParts = oThis.cookieValue.split(':');

    const version = cookieValueParts[0];

    // Whenever we introduce new cookie we can use a different number.
    if (version == cookieConstants.latestVersion) {
      if (cookieValueParts.length != 4) {
        return oThis._unauthorizedResponse('l_ulc_sp_1');
      }

      oThis.userId = cookieValueParts[1];
      oThis.timestamp = Number(cookieValueParts[2]);
      oThis.token = cookieValueParts[3];
    }
  }

  /**
   * Validate current user.
   *
   * @sets oThis.currentUser
   *
   * @returns {Promise<*>}
   * @private
   */
  async _fetchAndValidateCurrentUser() {
    const oThis = this;

    const resp = await new UserModel().getById(oThis.userId);
    oThis.currentUser = resp[0];

    if (oThis.currentUser.status !== userConstants.activeStatus) {
      return oThis._unauthorizedResponse('l_ulc_favcu_1');
    }
  }

  /**
   * Validate token.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _validateToken() {
    const oThis = this;

    const encryptedEncryptionSalt = coreConstants.GLOBAL_ENCRYPTED_ENCRYPTION_SALT;
    oThis.decryptedEncryptionSalt = localCipher.decrypt(coreConstants.ENCRYPTION_KEY, encryptedEncryptionSalt);

    const token = new UserModel().getCookieToken(oThis.currentUser, oThis.decryptedEncryptionSalt, {
      timestamp: oThis.timestamp
    });

    if (token !== oThis.token) {
      return oThis._unauthorizedResponse('l_ulc_vt_1');
    }
  }

  /**
   * Validate timestamp.
   *
   * @returns {*}
   * @private
   */
  _validateTimestamp() {
    const oThis = this;

    if (Math.round(Date.now() / 1000) > Math.round(oThis.timestamp + oThis.cookieExpiry)) {
      return oThis._unauthorizedResponse('l_ulc_vti_1');
    }
  }

  /**
   * Set cookie.
   *
   * @sets oThis.userLoginCookieValue
   *
   * @private
   */
  _setCookie() {
    const oThis = this;

    oThis.userLoginCookieValue = new UserModel().getCookieValue(oThis.currentUser, oThis.decryptedEncryptionSalt, {
      timestamp: Date.now() / 1000
    });
  }

  /**
   * Unauthorized response.
   *
   * @param {string} code
   *
   * @returns {Promise<never>}
   * @private
   */
  _unauthorizedResponse(code) {
    return Promise.reject(
      responseHelper.error({
        internal_error_identifier: code,
        api_error_identifier: 'unauthorized_api_request'
      })
    );
  }
}

module.exports = UserAuthLoginCookie;
