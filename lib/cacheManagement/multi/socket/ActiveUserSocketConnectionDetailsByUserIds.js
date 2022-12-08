const rootPrefix = '../../../..',
  CacheMultiBase = require(rootPrefix + '/lib/cacheManagement/multi/Base'),
  UserSocketConnectionDetailModel = require(rootPrefix + '/app/models/mysql/socket/UserSocketConnectionDetail'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for active user socket connection details by usersIds.
 *
 * @class ActiveUserSocketConnectionDetailsByUserIds
 */
class ActiveUserSocketConnectionDetailsByUserIds extends CacheMultiBase {
  /**
   * Init params in oThis.
   *
   * @param {object} params
   * @param {array<number>} params.userIds
   *
   * @private
   */
  _initParams(params) {
    const oThis = this;

    oThis.userIds = params.userIds;
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

    for (let index = 0; index < oThis.userIds.length; index++) {
      oThis.cacheKeys[oThis._cacheKeyPrefix() + '_cmm_auscd_buid_' + oThis.userIds[index]] = oThis.userIds[index];
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

    oThis.cacheExpiry = cacheManagementConstants.smallExpiryTimeInterval;
  }

  /**
   * Fetch data from source for cache miss ids.
   *
   * @param {array<number>} cacheMissIds
   *
   * @returns {Promise<result>}
   */
  async fetchDataFromSource(cacheMissIds) {
    const fetchActiveByUserIdsRsp = await new UserSocketConnectionDetailModel().fetchActiveByUserIds(cacheMissIds);

    return responseHelper.successWithData(fetchActiveByUserIdsRsp);
  }
}

module.exports = ActiveUserSocketConnectionDetailsByUserIds;
