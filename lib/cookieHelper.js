/* eslint-disable no-use-before-define */

const rootPrefix = '..',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  UserLoginCookieAuth = require(rootPrefix + '/lib/UserLoginCookie'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
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
   * @param {object} cookieOptions
   */
  setLensUserLoginCookie(requestObject, responseObject, cookieOptions) {
    const cookieValue = cookieOptions.cookieValue;
    const cookieName = cookieOptions.cookieName;
    const cookieExpiry = cookieOptions.cookieExpiry;

    const options = Object.assign({}, setCookieDefaultOptions, {
      maxAge: 1000 * cookieExpiry
    });

    responseObject.cookie(cookieName, cookieValue, options);
  }

  /**
   * Delete user login cookie from web/app.
   *
   * @param {object} requestObject
   * @param {object} responseObject
   */
  deleteUserLoginCookie(requestObject, responseObject) {
    responseObject.clearCookie(cookieConstants.lensUserLoginCookieName, deleteCookieOptions);
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
    let loginCookieValue = req.signedCookies[cookieConstants.lensUserLoginCookieName];

    if (CommonValidators.isVarNullOrUndefined(loginCookieValue)) {
      cookieHelperObj.deleteUserLoginCookie(req, res);
    } else {
      const authResponse = await new UserLoginCookieAuth(loginCookieValue, {
        expiry: cookieConstants.lensCookieExpiryTime,
        internalDecodedParams: req.internalDecodedParams
      })
        .perform()
        .catch(function(err) {
          return err;
        });

      if (authResponse.isFailure()) {
        cookieHelperObj.deleteUserLoginCookie(req, res);
        console.log(' In failure block of validateUserLoginCookieIfPresent Error is: ', authResponse);
      } else {
        req.internalDecodedParams.current_user = authResponse.data.current_user;
        const options = {
          cookieValue: authResponse.data.user_login_cookie_value,
          cookieName: cookieConstants.lensUserLoginCookieName,
          cookieExpiry: cookieConstants.lensCookieExpiryTime
        };
        cookieHelperObj.setLensUserLoginCookie(req, res, options);
      }
    }

    next();
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
    const currentUser = req.internalDecodedParams.current_user;

    if (!currentUser) {
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
