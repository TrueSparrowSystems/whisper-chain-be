/**
 * Class for api source constants.
 *
 * @class ApiSourceConstants
 */
class ApiSourceConstants {
  /**
   * Get string value for web source.
   *
   * @returns {string}
   */
  get web() {
    return 'web';
  }

  /**
   * Get string value for app source.
   *
   * @returns {string}
   */
  get app() {
    return 'app';
  }

  /**
   * Checks if request source is web.
   *
   * @param {string} source
   *
   * @returns {boolean}
   */
  isWebRequest(source) {
    const oThis = this;

    return source === oThis.web;
  }

  /**
   * Checks if request source is app.
   *
   * @param {string} source
   *
   * @returns {boolean}
   */
  isAppRequest(source) {
    const oThis = this;

    return source === oThis.app;
  }
}

module.exports = new ApiSourceConstants();
