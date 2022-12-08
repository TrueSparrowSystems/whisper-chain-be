/**
 * Cache management base
 *
 * @module lib/cacheManagement/shared/Base
 */

const { v4: uuidV4 } = require('uuid');

const rootPrefix = '../../..',
  MemcachedProvider = require(rootPrefix + '/lib/providers/memcached'),
  InMemoryCacheProvider = require(rootPrefix + '/lib/providers/inMemoryCache'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  cacheManagementConst = require(rootPrefix + '/lib/globalConstant/cacheManagement');

/**
 * Class for cache management single base
 *
 * @class CacheManagementBase
 */
class CacheManagementBase {
  /**
   * Constructor
   *
   * @param {Object} params: cache key generation & expiry related params
   *
   * @constructor
   */
  constructor(params = {}) {
    const oThis = this;

    oThis.consistentBehavior = '1';

    oThis.useObject = null;
    oThis.cacheKey = null;
    oThis.cacheLevel = null;
    oThis.cacheExpiry = null;
    oThis.cacheImplementer = null;
    oThis.cacheKeyPrefix = null;
    oThis.cacheType = null;

    oThis._initParams(params);

    if (oThis._isPaginatedCache()) {
      oThis._initPaginationParams();
    }

    oThis._setUseObject();

    oThis._setCacheType();

    if (oThis._isPaginatedCache()) {
      oThis.setPaginatedBaseCacheKey();
    } else {
      oThis.setCacheKey();
    }

    oThis.setCacheExpiry();

    oThis._setCacheImplementer();
  }

  /**
   * Init Params in oThis for pagination cache
   *
   * @private
   */
  _initPaginationParams() {
    const oThis = this;
    oThis.baseCacheKey = null;
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
      cacheObject = await MemcachedProvider.getInstance(oThis.consistentBehavior);
    } else if (oThis.cacheType === cacheManagementConst.inMemory) {
      cacheObject = await InMemoryCacheProvider.getInstance(oThis.consistentBehavior);
    } else {
      throw new Error(`Invalid CACHE TYPE-${oThis.cacheType}`);
    }

    // Set cacheImplementer to perform caching operations.
    oThis.cacheImplementer = cacheObject.cacheInstance;
  }

  /**
   * Fetch data from cache, in case of cache miss calls sub class method to fetch data from source
   *
   * @returns {Promise<Result>}: On success, data.value has value. On failure, error details returned.
   */
  async fetch() {
    const oThis = this;

    await oThis._setCacheImplementer();

    if (oThis._isPaginatedCache()) {
      await oThis._setPaginationCacheKey();
    }

    let data = await oThis._fetchFromCache();

    logger.debug('CACHE-FETCH## lib/cacheManagement/single/Base cache key: ', oThis.cacheKey);

    // If cache miss call sub class method to fetch data from source and set cache
    if (!data) {
      logger.debug('Data not found in cache: ', oThis.cacheKey);
      const fetchDataRsp = await oThis.fetchDataFromSource();

      // If fetch from source failed do not set cache and return error response
      if (fetchDataRsp.isFailure()) {
        return fetchDataRsp;
      }

      data = fetchDataRsp.data;

      if (data) {
        // Setting cache only if data is defined and not an empty object.
        await oThis._setCache(data);
      }
    }

    return responseHelper.successWithData(data);
  }

  /**
   * Set base cache key
   *
   * @returns {string}
   * @private
   */
  get _versionCacheKey() {
    const oThis = this;

    return oThis.baseCacheKey + '_v';
  }

  /**
   * Set cache key.
   *
   * @sets oThis.cacheKey
   *
   * @return {String}
   */
  async _setPaginationCacheKey() {
    const oThis = this;

    // Cache hit for version.
    const versionCacheResponse = await oThis.cacheImplementer.getObject(oThis._versionCacheKey);

    let versionDetail = null;

    if (versionCacheResponse.isSuccess() && versionCacheResponse.data.response != null) {
      versionDetail = versionCacheResponse.data.response;
    }

    if (!versionDetail || versionCacheResponse.isFailure()) {
      // Set version cache.
      versionDetail = {
        v: uuidV4()
      };

      await oThis.cacheImplementer.setObject(oThis._versionCacheKey, versionDetail, oThis.cacheExpiry);
    }

    let cacheKeySuffix = oThis._pageCacheKeySuffix();

    if (oThis.limit) {
      cacheKeySuffix += '_lmt_' + oThis.limit;
    }

    oThis.cacheKey = oThis.baseCacheKey + '_' + versionDetail.v + '_' + cacheKeySuffix;
  }

  /**
   * Delete the cache entry.
   *
   * @returns {Promise<*>}
   */
  async clear() {
    const oThis = this;

    await oThis._setCacheImplementer();

    if (oThis._isPaginatedCache()) {
      const key = oThis._versionCacheKey;
      logger.debug('CACHE-CLEAR## lib/cacheManagement/single/Base version cache key: ', key);

      return oThis.cacheImplementer.del(key);
    } else {
      logger.debug('CACHE-CLEAR## lib/cacheManagement/single/Base cache key: ', oThis.cacheKey);

      return oThis.cacheImplementer.del(oThis.cacheKey);
    }
  }

  // Private methods start from here

  /**
   * Fetch from cache
   *
   * @returns {Object}
   */
  async _fetchFromCache() {
    const oThis = this;

    let cacheFetchResponse = null,
      cacheData = null;

    if (oThis.useObject) {
      cacheFetchResponse = await oThis.cacheImplementer.getObject(oThis.cacheKey);
    } else {
      cacheFetchResponse = await oThis.cacheImplementer.get(oThis.cacheKey);
    }

    if (cacheFetchResponse.isSuccess()) {
      cacheData = cacheFetchResponse.data.response;
    }

    return cacheData;
  }

  /**
   * Set data in cache.
   *
   * @param {Object} dataToSet: data to set in cache
   *
   *
   * @return {Promise}
   * @private
   */
  async _setCache(dataToSet) {
    const oThis = this;

    await oThis._setCacheImplementer();
    logger.debug('CACHE-SET## lib/cacheManagement/single/Base cache key: ', oThis.cacheKey);

    const setCacheFunction = function() {
      if (oThis.useObject) {
        return oThis.cacheImplementer.setObject(oThis.cacheKey, dataToSet, oThis.cacheExpiry);
      }

      return oThis.cacheImplementer.set(oThis.cacheKey, dataToSet, oThis.cacheExpiry);
    };

    return setCacheFunction().then(async function(cacheSetResponse) {
      if (cacheSetResponse.isFailure()) {
        const errorObject = responseHelper.error({
          internal_error_identifier: 'cache_not_set:l_cm_s_b_1',
          api_error_identifier: 'cache_not_set',
          debug_options: { cacheSetResponse: cacheSetResponse.getDebugData(), dataToSet: dataToSet }
        });
        await createErrorLogsEntry.perform(errorObject, errorLogsConstants.mediumSeverity);
        logger.error('l_cm_s_b_1', 'Error in setting cache.', cacheSetResponse.getDebugData());
      }
    });
  }

  /**
   * Cache key prefix
   *
   * @sets oThis.cacheKeyPrefix
   *
   * @return {String}
   */
  _cacheKeyPrefix() {
    const oThis = this;
    if (oThis.cacheKeyPrefix) {
      return oThis.cacheKeyPrefix;
    }
    oThis.cacheKeyPrefix = cacheManagementConst.keyPrefix;

    return oThis.cacheKeyPrefix;
  }

  /**
   * True if its a cache for pagination
   *
   * @sets oThis.useObject
   *
   * @private
   */
  _isPaginatedCache() {
    return false;
  }

  // Methods which the sub-class would have to implement

  /**
   * Init params in oThis
   *
   * @private
   */
  _initParams() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set use object
   *
   * @sets oThis.useObject
   *
   * @private
   */
  _setUseObject() {
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
   * Set base cache key in oThis.baseCacheKey and return it
   *
   * @returns {String}
   */
  setPaginatedBaseCacheKey() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set cache key in oThis.cacheKey and return it
   *
   * @returns {String}
   */
  setCacheKey() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Set cache expiry in oThis.cacheExpiry and return it
   *
   * @returns {Number}
   */
  setCacheExpiry() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Fetch data from source.
   *
   * NOTES: 1. return should be of Class Result
   *        2. data attr of return is returned and set in cache
   *
   * @returns {Result}
   */
  async fetchDataFromSource() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = CacheManagementBase;
