/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../..',
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  CacheMultiBase = require(rootPrefix + '/lib/cacheManagement/multi/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement');

/**
 * Class for users by ids cache.
 *
 * @class UsersByIds
 */
class UsersByIds extends CacheMultiBase {
  /**
   * Init params in oThis
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

    for (let ind = 0; ind < oThis.ids.length; ind++) {
      oThis.cacheKeys[oThis._cacheKeyPrefix() + '_cmm_usr_bid_' + oThis.ids[ind]] = oThis.ids[ind];
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
   * Fetch data from source for cache miss ids
   *
   * @param {array<number>} cacheMissIds
   *
   * @return {Promise<*>}
   */
  async fetchDataFromSource(cacheMissIds) {
    const fetchByIdsRsp = await new UserModel().fetchByIds(cacheMissIds);

    return responseHelper.successWithData(fetchByIdsRsp);
  }
}

module.exports = UsersByIds;
