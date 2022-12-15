const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let invertedPlatforms, invertedStatuses;

/**
 * Class for whispers constants.
 *
 * @class Whispers
 */
class Whispers {
  // Whispers platform enum types start.

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

  // Whispers platform enum types end.

  // Status enum types start.

  /**
   * Get string value for active status.
   *
   * @returns {string}
   */
  get activeStatus() {
    return 'ACTIVE';
  }

  /**
   * Get string value for inactive status.
   *
   * @returns {string}
   */
  get inactiveStatus() {
    return 'INACTIVE';
  }

  // Status enum types end.

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

  /**
   * Get status by enum.
   *
   * @returns {object}
   */
  get statuses() {
    const oThis = this;

    return {
      '1': oThis.activeStatus,
      '2': oThis.inactiveStatus
    };
  }

  /**
   * Get enum value by status.
   *
   * @returns {object}
   */
  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }
}

module.exports = new Whispers();
