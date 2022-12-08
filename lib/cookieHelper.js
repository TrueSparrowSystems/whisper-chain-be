/* eslint-disable no-use-before-define */

const rootPrefix = '..',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions');

const setCookieDefaultOptions = {
  httpOnly: true,
  signed: true,
  path: '/',
  domain: coreConstants.A_COOKIE_DOMAIN,
  secure: basicHelper.isProduction(),
  sameSite: 'lax'
};

const deleteCookieOptions = { domain: coreConstants.A_COOKIE_DOMAIN };

const errorConfig = basicHelper.fetchErrorConfig(apiVersions.web);

/**
 * Class for cookie helper.
 *
 * @class CookieHelper
 */
class CookieHelper {
  /**
   * Set user login cookie in web.
   *
   * @param {object} requestObject
   * @param {object} responseObject
   * @param {string} cookieValue
   */
  setUserLoginCookie(requestObject, responseObject, cookieValue) {
    const options = Object.assign({}, setCookieDefaultOptions, {
      maxAge: 1000 * cookieConstants.userCookieExpiryTime
    });

    if (requestObject.internalDecodedParams.api_source == apiSourceConstants.app) {
      responseObject.cookie(cookieConstants.appUserLoginCookieName, cookieValue, options);
    } else {
      responseObject.cookie(cookieConstants.webUserLoginCookieName, cookieValue, options);
    }
  }

  /**
   * Delete user login cookie from web/app.
   *
   * @param {object} requestObject
   * @param {object} responseObject
   */
  deleteUserLoginCookie(requestObject, responseObject) {
    if (requestObject.internalDecodedParams.api_source == apiSourceConstants.app) {
      responseObject.clearCookie(cookieConstants.appUserLoginCookieName, deleteCookieOptions);
    } else {
      responseObject.clearCookie(cookieConstants.webUserLoginCookieName, deleteCookieOptions);
    }
  }

  /**
   * Validate User login cookie if present.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   *
   * @returns {Promise<void>}
   */
  async validateUserLoginCookieIfPresent(req, res, next) {
    let loginCookieValue = null;
    if (req.internalDecodedParams.api_source == apiSourceConstants.app) {
      loginCookieValue = req.signedCookies[cookieConstants.appUserLoginCookieName];
    } else {
      loginCookieValue = req.signedCookies[cookieConstants.webUserLoginCookieName];
    }

    if (CommonValidators.isVarNullOrUndefined(loginCookieValue)) {
      cookieHelperObj.deleteUserLoginCookie(req, res);
    } else {
      await cookieHelperObj.validateLoginCookieValue(req.internalDecodedParams, loginCookieValue);
      req.internalDecodedParams.user_login_cookie_value = loginCookieValue;
    }
    next();
  }

  /**
   * Validate login cookie value
   *
   * @param {object} internalDecodeParams
   * @param {string} cookieValue
   *
   * @returns {Promise<never>}
   */
  async validateLoginCookieValue(internalDecodeParams, cookieValue) {
    const cookieValueParts = cookieValue.split(':');

    const cookieSource = cookieValueParts[1],
      userId = cookieValueParts[2],
      timestamp = Number(cookieValueParts[3]),
      token = cookieValueParts[4];

    if (cookieSource != internalDecodeParams.api_source) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_ch_vlcv_1',
          api_error_identifier: 'unauthorized_api_request'
        })
      );
    }

    const user = await new UserModel().fetchSecureById(userId);

    const fetchedToken = new UserModel().getCookieToken(user, coreConstants.ENCRYPTION_KEY, {
      timestamp: timestamp,
      apiSource: cookieSource
    });

    if (fetchedToken != token) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_ch_vlcv_2',
          api_error_identifier: 'unauthorized_api_request'
        })
      );
    }
  }

  /**
   * Validate user login cookie value
   * @param {object} req
   * @param {object} res
   * @param {function} next
   *
   * @returns {Promise<*>}
   */
  async validateUserLoginCookieRequired(req, res, next) {
    const userLoginCookieValue = req.internalDecodedParams.user_login_cookie_value;

    if (!userLoginCookieValue) {
      cookieHelperObj.deleteUserLoginCookie(req, res);

      const errResponse = responseHelper.error({
        internal_error_identifier: 'l_ch_vuwlcr_1',
        api_error_identifier: 'unauthorized_api_request'
      });

      return responseHelper.renderApiResponse(errResponse, res, errorConfig);
    }
    next();
  }
}

const cookieHelperObj = new CookieHelper();
// Instead of using oThis, object is being used in this file as this is executed in express in a different
// Scope which does not have information about oThis.
module.exports = cookieHelperObj;
