const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants');

/**
 * Class for cache management constants.
 *
 * @class CacheManagementConstants
 */
class CacheManagementConstants {
  /**
   * Get memcached cache type.
   *
   * @returns {string}
   */
  get memcached() {
    return 'memcached';
  }

  /**
   * Get in memory cache type.
   *
   * @returns {string}
   */
  get inMemory() {
    return 'in_memory';
  }

  /**
   * Get cache key prefix.
   *
   * @returns {string}
   */
  get keyPrefix() {
    return `${coreConstants.environmentShort}`;
  }

  /**
   * Get very small expiry time as one minute.
   *
   * @returns {number}
   */
  get verySmallExpiryTimeInterval() {
    return 60;
  }

  /**
   * Get five minutes expiry time.
   *
   * @returns {number}
   */
  get fiveMinsExpiryTimeInterval() {
    return 300;
  }

  /**
   * Get ten minutes expiry time.
   *
   * @returns {number}
   */
  get smallExpiryTimeInterval() {
    return 600;
  }

  /**
   * Get sixty minutes expiry time.
   *
   * @returns {number}
   */
  get mediumExpiryTimeInterval() {
    return 3600;
  }

  /**
   * Get ten hours time.
   *
   * @returns {number}
   */
  get tenHourTimeInterval() {
    return 3600 * 10;
  }

  /**
   * Get large expiry time interval as one day.
   *
   * @returns {number}
   */
  get largeExpiryTimeInterval() {
    return 86400;
  }

  /**
   * Get max expiry time interval as thirty days.
   *
   * @returns {number}
   */
  get maxExpiryTimeInterval() {
    return 2592000;
  }
}

module.exports = new CacheManagementConstants();
