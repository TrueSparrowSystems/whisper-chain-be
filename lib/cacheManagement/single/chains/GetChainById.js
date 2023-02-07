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
class GetChainById extends CacheSingleBase {
  /**
   * Init Params in oThis.
   *
   * @param {object} params
   * @param {number} params.id
   *
   * @private
   */
  _initParams(params) {
    const oThis = this;
    oThis.id = params.id;
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

    oThis.useObject = true;
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
  setCacheKey() {
    const oThis = this;
    oThis.cacheKey = oThis._cacheKeyPrefix() + '_at_id_' + oThis.id;
    return oThis.cacheKey;
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
   * Fetch data from source
   *
   * @return {Promise<result>}
   */
  async fetchDataFromSource() {
    const oThis = this;

    // This value is only returned if cache is not set.
    const chainObj = await new ChainsModel().getById(oThis.id);

    // Variable chainObj will have data, which has themeIds and themesMap.
    // It can be Accessed using, chainObj.data.themeIds and chainObj.data.themesMap.

    return responseHelper.successWithData(chainObj);
  }
}

module.exports = GetChainById;
