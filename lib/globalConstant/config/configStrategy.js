const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

// Declare constants.
let kinds, invertedKinds, statuses, invertedStatuses;

/**
 * Class for config strategy constants.
 *
 * @class ConfigStrategy
 */
class ConfigStrategy {
  // Config strategy kinds start.

  /**
   * Get string value for memcached.
   *
   * @returns {string}
   */
  get memcached() {
    return 'memcached';
  }

  /**
   * Get string value for  bgJobRabbitmq.
   *
   * @returns {string}
   */
  get bgJobRabbitmq() {
    return 'bgJobRabbitmq';
  }

  /**
   * Get string value for cassandra.
   *
   * @returns {string}
   */
  get cassandra() {
    return 'cassandra';
  }

  /**
   * Get string value for socketRabbitmq.
   *
   * @returns {string}
   */
  get socketRabbitmq() {
    return 'socketRabbitmq';
  }

  /**
   * Get string value for websocket.
   *
   * @returns {string}
   */
  get websocket() {
    return 'websocket';
  }

  // Config strategy kinds end.

  // Config strategy statuses start.

  /**
   * Get string value for active status.
   *
   * @returns {string}
   */
  get activeStatus() {
    return 'active';
  }

  /**
   * Get string value for inactive status.
   *
   * @returns {string}
   */
  get inActiveStatus() {
    return 'inactive';
  }

  // Config strategy statuses end.

  /**
   * Get kind from enum.
   *
   * @returns {object}
   */
  get kinds() {
    const oThis = this;

    if (kinds) {
      return kinds;
    }

    kinds = {
      '1': oThis.memcached,
      '2': oThis.bgJobRabbitmq,
      '3': oThis.cassandra,
      '4': oThis.socketRabbitmq,
      '5': oThis.websocket
    };

    return kinds;
  }

  /**
   * Get kind enum by kind string.
   *
   * @returns {string}
   */
  get invertedKinds() {
    const oThis = this;

    invertedKinds = invertedKinds || util.invert(oThis.kinds);

    return invertedKinds;
  }

  /**
   * Get status value by enum.
   *
   * @returns {object}
   */
  get statuses() {
    const oThis = this;

    if (statuses) {
      return statuses;
    }

    statuses = {
      '1': oThis.activeStatus,
      '2': oThis.inActiveStatus
    };

    return statuses;
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
}

module.exports = new ConfigStrategy();
