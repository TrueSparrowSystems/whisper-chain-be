const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let invertedStatuses, propertiesHash, invertedPropertiesHash;

/**
 * Class for user constants.
 *
 * @class UserConstants
 */
class UserConstants {
  /**
   * Get string value for active status.
   *
   * @returns {string}
   */
  get activeStatus() {
    return 'ACTIVE';
  }

  /**
   * Get string value for deleted status.
   *
   * @returns {string}
   */
  get deletedStatus() {
    return 'DELETED';
  }

  /**
   * Get enum for status.
   *
   * @returns {object}
   */
  get statuses() {
    const oThis = this;

    return {
      '1': oThis.activeStatus,
      '2': oThis.deletedStatus
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

  /**
   * Get string value for test user property.
   *
   * @returns {string}
   */
  get testUserProperty() {
    return 'USE_YOUR_OWN_PROPERTY';
  }

  /**
   * Get bit by property.
   *
   * @returns {object}
   */
  get properties() {
    const oThis = this;

    propertiesHash = propertiesHash || {
      '1': oThis.testUserProperty
    };

    return propertiesHash;
  }

  /**
   * Get property by bit.
   *
   * @returns {object}
   */
  get invertedProperties() {
    const oThis = this;

    invertedPropertiesHash = invertedPropertiesHash || util.invert(oThis.properties);

    return invertedPropertiesHash;
  }
}

module.exports = new UserConstants();
