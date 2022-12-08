const { Base64 } = require('js-base64');

/**
 * Class for base 64 helper.
 *
 * @class Base64Helper
 */
class Base64Helper {
  /**
   * Encode to base64 data.
   *
   * @param {object} data
   *
   * @returns {string}
   */
  encode(data) {
    return Base64.encode(data);
  }

  /**
   * Decode base64 data.
   *
   * @param {string} base64data
   *
   * @returns {string}
   */
  decode(base64data) {
    return Base64.decode(base64data);
  }
}

module.exports = new Base64Helper();
