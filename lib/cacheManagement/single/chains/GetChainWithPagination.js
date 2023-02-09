/* eslint-disable no-unused-vars */
const rootPrefix = '../../../..',
  ChainsModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  CacheSingleBase = require(rootPrefix + '/lib/cacheManagement/single/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement');

/**
 * Class to get active chains from cache.
 *
 * @class getById
 */
class GetChainWithPagination extends CacheSingleBase {
  /**
   * Init Params in oThis.
   *
   * @param {object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {number} params.platform
   *
   * @sets oThis.limit, oThis.page, oThis.platform
   *
   * @private
   */
  _initParams(params) {
    const oThis = this;
    oThis.page = params.page;
    oThis.limit = params.limit;
    oThis.platform = params.platform;
  }

  /**
   * True if its a cache for pagination.
   *
   * @private
   */
  _isPaginatedCache() {
    return true;
  }

  /**
   * Set use object.
   *
   * @sets oThis.useObject
   *
   * @private
   */
  _setUseObject() {
    const oThis = this;

    oThis.useObject = false;
  }

  /**
   * Set cache type.
   *
   * @sets oThis.cacheType
   *
   * @private
   */
  _setCacheType() {
    const oThis = this;

    oThis.cacheType = cacheManagementConstants.memcached;
  }

  /**
   * Set cache key.
   *
   * @sets oThis.cacheKey
   *
   * @returns {string}
   */
  setPaginatedBaseCacheKey() {
    const oThis = this;
    oThis.baseCacheKey = oThis._cacheKeyPrefix() + '_page_' + oThis.page;

    return oThis.baseCacheKey;
  }

  /**
   * Set cache expiry in oThis.cacheExpiry and return it.
   *
   * @sets oThis.cacheExpiry
   *
   * @return {number}
   */
  setCacheExpiry() {
    const oThis = this;

    oThis.cacheExpiry = cacheManagementConstants.mediumExpiryTimeInterval;

    return oThis.cacheExpiry;
  }

  /**
   * Get paginationTimestamp cache key suffix for paginated cache.
   *
   * @returns {number}
   * @private
   */
  _pageCacheKeySuffix() {
    const oThis = this;

    return '_home_';
  }

  /**
   * Fetch data frome cache
   *
   * @return {obj}
   */
  async fetchFromCache() {
    const oThis = this;
    await oThis._setCacheImplementer();

    if (oThis._isPaginatedCache()) {
      await oThis._setPaginationCacheKey();
    }
    console.log('key ', oThis.cacheKey);
    const cacheValue = await oThis._fetchFromCache();
    if (cacheValue === null) {
      return false;
    }

    return true;
  }

  /**
   * Fetch data from source
   *
   * @return {Promise<result>}
   */
  async fetchDataFromSource() {
    const oThis = this;

    // This value is only returned if cache is not set.
    const chainArray = await new ChainsModel().getActiveChainsDataWithPagination(
      oThis.page,
      oThis.limit,
      oThis.platform
    );

    // Variable chainObj will have data, which has themeIds and themesMap.
    // It can be Accessed using, chainObj.data.themeIds and chainObj.data.themesMap.

    return responseHelper.successWithData(chainArray);
  }
}

module.exports = GetChainWithPagination;
