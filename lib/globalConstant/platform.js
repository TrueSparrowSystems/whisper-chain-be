const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util');

let invertedPlatforms;

/**
 * Class for whispers constants.
 *
 * @class Platforms
 */
class Platforms {
  // Platforms platform enum types start.

  /**
   * Get name for lens platform.
   *
   * @returns {string}
   */
  get lensPlatform() {
    return 'LENS';
  }

  /**
   * Get name for twitter platform.
   *
   * @returns {string}
   */
  get twitterPlatform() {
    return 'TWITTER';
  }

  // Platforms platform enum types end.

  /**
   * Get platform types by enum value.
   *
   * @returns {object}
   */
  get platforms() {
    const oThis = this;

    return {
      '1': oThis.lensPlatform,
      '2': oThis.twitterPlatform
    };
  }

  /**
   * Get enum by platform types.
   *
   * @returns {object}
   */
  get invertedPlatforms() {
    const oThis = this;

    invertedPlatforms = invertedPlatforms || util.invert(oThis.platforms);

    return invertedPlatforms;
  }
}

module.exports = new Platforms();
