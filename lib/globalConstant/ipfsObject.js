const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util');

let invertedKinds;

/**
 * Class for ipfs object constants.
 *
 * @class IpfsObject
 */
class IpfsObject {
  /**
   * Get string value for chain.
   *
   * @returns {string}
   */
  get chain() {
    return 'chain';
  }

  /**
   * Get string value for chain.
   *
   * @returns {string}
   */
  get whisper() {
    return 'whisper';
  }

  /**
   * Get string value for chain.
   *
   * @returns {string}
   */
  get image() {
    return 'image';
  }

  /**
   * Get kind by enum value.
   *
   * @returns {object}
   */
  get kinds() {
    const oThis = this;

    return {
      '1': oThis.chain,
      '2': oThis.whisper,
      '3': oThis.image
    };
  }

  /**
   * Get enum by kind.
   *
   * @returns {object}
   */
  get invertedKinds() {
    const oThis = this;

    invertedKinds = invertedKinds || util.invert(oThis.kinds);

    return invertedKinds;
  }
}

module.exports = new IpfsObject();
