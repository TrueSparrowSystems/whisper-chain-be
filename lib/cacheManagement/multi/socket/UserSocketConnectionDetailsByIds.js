const rootPrefix = '../../../..',
  CacheMultiBase = require(rootPrefix + '/lib/cacheManagement/multi/Base'),
  UserSocketConnectionDetailModel = require(rootPrefix + '/app/models/mysql/socket/UserSocketConnectionDetail'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for user socket connection details by ids.
 *
 * @class UserSocketConnectionDetailsByIds
 */
class UserSocketConnectionDetailsByIds extends CacheMultiBase {
  /**
   * Init params in oThis.
   *
   * @param {object} params
   * @param {array<number>} params.ids
   *
   * @private
   */
  _initParams(params) {
    const oThis = this;

    oThis.ids = params.ids;
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
   * Set cache keys.
   *
   * @sets oThis.cacheKeys
   *
   * @private
   */
  _setCacheKeys() {
    const oThis = this;

    for (let index = 0; index < oThis.ids.length; index++) {
      oThis.cacheKeys[oThis._cacheKeyPrefix() + '_cmm_uscd_bid_' + oThis.ids[index]] = oThis.ids[index];
    }
  }

  /**
   * Set cache expiry.
   *
   * @sets oThis.cacheExpiry
   *
   * @private
   */
  _setCacheExpiry() {
    const oThis = this;

    oThis.cacheExpiry = cacheManagementConstants.largeExpiryTimeInterval;
  }

  /**
   * Fetch data from source for cache miss ids.
   *
   * @param {array<number>} cacheMissIds
   *
   * @returns {Promise<result>}
   */
  async fetchDataFromSource(cacheMissIds) {
    const fetchByIdsRsp = await new UserSocketConnectionDetailModel().fetchByIds(cacheMissIds);

    return responseHelper.successWithData(fetchByIdsRsp);
  }
}

module.exports = UserSocketConnectionDetailsByIds;
