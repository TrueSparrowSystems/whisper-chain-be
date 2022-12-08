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
   * Get latest cookie version.
   *
   * @returns {number}
   */
  get latestVersion() {
    return '1';
  }
}

module.exports = new CookieConstants();
