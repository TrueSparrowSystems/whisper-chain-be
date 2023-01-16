/**
 * Class for cookie constants.
 *
 * @class CookieConstants
 */
class CookieConstants {
  /**
   * Get expiry time for user cookie.
   *
   * @returns {number}
   */
  get userCookieExpiryTime() {
    return 60 * 60 * 24 * 30; // 30 days
  }

  /**
   * Get cookie name for user web login cookie.
   *
   * @returns {string}
   */
  get webUserLoginCookieName() {
    return 'wulc';
  }

  /**
   * Get cookie name for user app login cookie.
   *
   * @returns {string}
   */
  get appUserLoginCookieName() {
    return 'aulc';
  }

  /**
   * Get cookie name for lens login cookie.
   *
   * @returns {string}
   */
  get lensUserLoginCookieName() {
    return 'lulc';
  }

  /**
   * Get expiry time for lens cookie.
   *
   * @returns {number}
   */
  get lensCookieExpiryTime() {
    return 60 * 60 * 24 * 30; // 30 days
  }

  /**
   * Get latest cookie version.
   *
   * @returns {number}
   */
  get latestVersion() {
    return '1';
  }
}

module.exports = new CookieConstants();
