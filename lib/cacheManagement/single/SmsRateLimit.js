const rootPrefix = '../../..',
  MemcachedProvider = require(rootPrefix + '/lib/providers/memcached'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  basicHelper = require(rootPrefix + '/helpers/basic');

class SmsRateLimit {
  /**
   * @constructor
   *
   * @param params
   * @param params.phoneNumber {String}
   */
  constructor(params) {
    const oThis = this;

    oThis.cacheType = cacheManagementConstants.memcached;
    oThis.phoneNumber = params.phoneNumber;

    // Set cache key using params provided
    oThis._setCacheKey();

    // Call sub class method to set cache expiry using params provided
    oThis._setCacheExpiry();
  }

  /**
   * Set cache key
   *
   * @sets oThis.cacheKey
   */
  _setCacheKey() {
    const oThis = this;

    oThis.cacheKey = cacheManagementConstants.keyPrefix + 'sms_rl_' + oThis.phoneNumber;
  }

  /**
   * Set cache expiry
   *
   * @sets oThis.cacheExpiry
   */
  _setCacheExpiry() {
    const oThis = this;

    oThis.cacheExpiry = 3600; // One hour
  }

  /**
   * Max hits allowed in expiry duration (1 hour)
   *
   * @returns {number}
   * @private
   */
  get _maxHitsAllowed() {
    if (basicHelper.isProduction()) {
      return 20;
    }

    return 5;
  }

  /**
   * Set cache implementer in oThis.cacheExpiry and return it
   *
   * @returns {Number}
   */
  async _setCacheImplementer() {
    const oThis = this;

    oThis.cacheObject = await MemcachedProvider.getInstance();

    // Set cacheImplementer to perform caching operations
    oThis.cacheImplementer = oThis.cacheObject.cacheInstance;
  }

  /**
   * Check limit
   *
   * @returns {Promise<never>}
   */
  async checkLimit() {
    const oThis = this;

    await oThis._setCacheImplementer();

    const getResponse = await oThis.cacheImplementer.get(oThis.cacheKey);
    const getValue = getResponse.data.response;

    if (getValue) {
      if (getValue < oThis._maxHitsAllowed) {
        await oThis.cacheImplementer.increment(oThis.cacheKey, 1);

        return;
      } else {
        return Promise.reject(
          responseHelper.error({
            internal_error_identifier: 'RATE_LIMIT_CROSSED',
            api_error_identifier: 'something_went_wrong',
            debug_options: {
              phoneNumber: oThis.phoneNumber
            }
          })
        );
      }
    } else {
      await oThis.cacheImplementer.set(oThis.cacheKey, 1);

      return;
    }
  }

  /**
   * Delete the cache entry
   *
   * @returns {Promise<*>}
   */
  async clear() {
    const oThis = this;

    return oThis.cacheImplementer.del(oThis.cacheKey);
  }
}

module.exports = SmsRateLimit;
