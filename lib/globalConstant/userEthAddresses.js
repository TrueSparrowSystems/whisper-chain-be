const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util');

let invertedKinds;

/**
 * Class for user eth addresses constants.
 *
 * @class UserEthAddressesConstants
 */
class UserEthAddressesConstants {
  // kind enum starts
  /**
   * Get string value for auth kind.
   *
   * @returns {string}
   */
  get authKind() {
    return 'AUTH';
  }
  // kind enum ends

  /**
   * Get enum for kinds.
   *
   * @returns {object}
   */
  get kinds() {
    const oThis = this;

    return {
      '1': oThis.authKind
    };
  }

  /**
   * Get enum value from kind string.
   *
   * @returns {object}
   */
  get invertedKinds() {
    const oThis = this;

    invertedKinds = invertedKinds || util.invert(oThis.kinds);

    return invertedKinds;
  }
}

module.exports = new UserEthAddressesConstants();
