const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util');

let invertedStatuses, invertedKinds;

/**
 * Class for user constants.
 *
 * @class UserConstants
 */
class UserConstants {
  // status enum starts
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
  // status enum ends

  /**
   * Get enum for status.
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
   * Get enum value from status string.
   *
   * @returns {object}
   */
  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }

  // kind enum starts
  /**
   * Get string value for internal kind.
   *
   * @returns {string}
   */
  get internalKind() {
    return 'INTERNAL';
  }

  /**
   * Get string value for external kind.
   *
   * @returns {string}
   */
  get externalKind() {
    return 'EXTERNAL';
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
      '1': oThis.internalKind,
      '2': oThis.externalKind
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

module.exports = new UserConstants();
