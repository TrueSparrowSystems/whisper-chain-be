const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  memcachedProvider = require(rootPrefix + '/lib/providers/memcached'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  inMemoryCacheProvider = require(rootPrefix + '/lib/providers/inMemoryCache'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  cacheManagementConst = require(rootPrefix + '/lib/globalConstant/cacheManagement');

/**
 * Class for cache multi management base.
 *
 * @class CacheMultiBase
 */
class CacheMultiBase {
  /**
   * Constructor for cache multi management base.
   *
   * @param {object} params: cache key generation & expiry related params.
   *
   * @constructor
   */
  constructor(params = {}) {
    const oThis = this;

    oThis.consistentBehavior = '1';

    oThis.cacheExpiry = null;
    oThis.cacheKeys = {};
    oThis.invertedCacheKeys = {};
    oThis.cacheImplementer = null;
    oThis.cacheKeyPrefix = null;

    oThis._initParams(params);

    oThis._setCacheType();

    oThis._setCacheKeys();

    oThis._setInvertedCacheKeys();

    oThis._setCacheExpiry();

    oThis._setCacheImplementer();
  }

  /**
   * Set cache implementer in oThis.cacheImplementer.
   *
   * @sets oThis.cacheImplementer
   *
   * @returns {Promise<void>}
   * @private
   */
  async _setCacheImplementer() {
    const oThis = this;

    if (oThis.cacheImplementer) {
      return;
    }

    let cacheObject = null;

    if (oThis.cacheType === cacheManagementConst.memcached) {
      cacheObject = await memcachedProvider.getInstance(oThis.consistentBehavior);
    } else if (oThis.cacheType === cacheManagementConst.inMemory) {
      cacheObject = await inMemoryCacheProvider.getInstance(oThis.consistentBehavior);
    } else {
      throw new Error('Invalid CACHE TYPE-', oThis.cacheType);
    }

    // Set cacheImplementer to perform caching operations.
    oThis.cacheImplementer = cacheObject.cacheInstance;
  }

  /**
   * Fetch data from cache.
   *
   * @returns {Promise<result>}
   */
  async fetch() {
    const oThis = this,
      batchSize = 50;

    if (basicHelper.isEmptyObject(oThis.cacheKeys)) {
      logger.trace(`Empty cache keys object in ${oThis.constructor.name}`);
    } else {
      logger.debug(`CACHE-FETCH## ${oThis.constructor.name} cache key: `, oThis.cacheKeys);
    }

    await oThis._setCacheImplementer();

    const data = await oThis._fetchFromCache();

    let fetchDataRsp = null;

    // If there are any cache misses then fetch that data from source.
    while (data.cacheMiss.length > 0) {
      const cacheMissData = data.cacheMiss.splice(0, batchSize);
      fetchDataRsp = await oThis.fetchDataFromSource(cacheMissData);

      // DO NOT WAIT for cache being set
      for (let index = 0; index < cacheMissData.length; index++) {
        const cacheMissFor = cacheMissData[index];
        if (!cacheMissFor) {
          throw new Error(`c_m_b_f_1::INVALID CACHE key.Cachekeys-${oThis.cacheKeys}`);
        }
        const dataToSet =
          fetchDataRsp.data[cacheMissFor] || fetchDataRsp.data[cacheMissFor.toString().toLowerCase()] || {};
        data.cachedData[cacheMissFor] = dataToSet;
        oThis._setCache(cacheMissFor, dataToSet);
      }
    }

    return Promise.resolve(responseHelper.successWithData(data.cachedData));
  }

  /**
   * Delete the cache entry.
   *
   * @returns {Promise<*>}
   */
  async clear() {
    const oThis = this;

    await oThis._setCacheImplementer();

    const promises = [];
    for (let index = 0; index < Object.keys(oThis.cacheKeys).length; index++) {
      const cacheKey = Object.keys(oThis.cacheKeys)[index];
      logger.debug('CACHE-CLEAR## lib/cacheManagement/multi/Base cache key: ', cacheKey);
      promises.push(oThis.cacheImplementer.del(cacheKey));
    }

    return Promise.all(promises);
  }

  /**
   * Set inverted cache keys.
   *
   * @private
   */
  _setInvertedCacheKeys() {
    const oThis = this;

    oThis.invertedCacheKeys = util.invert(oThis.cacheKeys);
  }

  // Private methods start from here.

  /**
   * Fetch from cache.
   *
   * @returns {Object}
   * @private
   */
  async _fetchFromCache() {
    const oThis = this;
    const cacheKeys = Object.keys(oThis.cacheKeys),
      cacheMiss = [],
      cachedResponse = {},
      batchSize = 500;
    let cacheFetchResponse = null,
      processCacheKeys = [];

    while (cacheKeys.length > 0) {
      processCacheKeys = cacheKeys.splice(0, batchSize);
      cacheFetchResponse = await oThis.cacheImplementer.multiGet(processCacheKeys);

      if (cacheFetchResponse.isSuccess()) {
        const cachedData = cacheFetchResponse.data.response;
        for (let index = 0; index < processCacheKeys.length; index++) {
          const cacheKey = processCacheKeys[index];
          if (cachedData[cacheKey]) {
            cachedResponse[oThis.cacheKeys[cacheKey]] = JSON.parse(cachedData[cacheKey]);
          } else {
            cacheMiss.push(oThis.cacheKeys[cacheKey]);
          }
        }
      } else {
        logger.error('==>Error while getting from cache: ', cacheFetchResponse.getDebugData());
        for (let index = 0; index < processCacheKeys.length; index++) {
          const cacheKey = processCacheKeys[index];
          cacheMiss.push(oThis.cacheKeys[cacheKey]);
        }
      }
    }

    return { cacheMiss: cacheMiss, cachedData: cachedResponse };
  }

  /**
   * Set data in cache.
   *
   * @param {string} key: key for cache data
   * @param {object} dataToSet: data to set in cache
   *
   *
   * @return {Promise}
   * @private
   */
  async _setCache(key, dataToSet) {
    const oThis = this;

    const cacheKey = oThis.invertedCacheKeys[key.toString()];
    logger.debug('CACHE-SET## lib/cacheManagement/multi/Base cache key: ', key);

    await oThis._setCacheImplementer();

    return oThis.cacheImplementer
      .set(cacheKey, JSON.stringify(dataToSet), oThis.cacheExpiry)
      .then(async function(cacheSetResponse) {
        if (cacheSetResponse.isFailure()) {
          const errorObject = responseHelper.error({
            internal_error_identifier: 'cache_not_set:l_cm_m_b_1',
            api_error_identifier: 'cache_not_set',
            debug_options: { cacheSetResponse: cacheSetResponse.getDebugData(), key: key, dataToSet: dataToSet }
          });
          await createErrorLogsEntry.perform(errorObject, errorLogsConstants.mediumSeverity);
          logger.error('l_cm_m_b_1', 'Error in setting cache.', cacheSetResponse.getDebugData());
        }
      });
  }

  /**
   * Cache key prefix.
   *
   * @sets oThis.cacheKeyPrefix
   *
   * @return {string}
   */
  _cacheKeyPrefix() {
    const oThis = this;
    if (oThis.cacheKeyPrefix) {
      return oThis.cacheKeyPrefix;
    }
    oThis.cacheKeyPrefix = cacheManagementConst.keyPrefix;

    return oThis.cacheKeyPrefix;
  }

  // Methods which sub class would have to implement.

  /**
   * Init params in oThis.
   *
   * @private
   */
  _initParams() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set cache type.
   *
   * @sets oThis.cacheType
   *
   * @returns {string}
   */
  _setCacheType() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set cache keys in oThis.cacheKeys and return it.
   *
   * @return {String}
   */
  _setCacheKeys() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set cache expiry in oThis.cacheExpiry and return it.
   *
   * @return {Number}
   */
  _setCacheExpiry() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Fetch data from source.
   * NOTES: 1. return should be of class Result.
   *        2. data attr of return is returned and set in cache.
   *
   * @returns {Result}
   */
  async fetchDataFromSource() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = CacheMultiBase;
