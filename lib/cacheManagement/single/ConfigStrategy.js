const rootPrefix = '../../..',
  CacheSingleBase = require(rootPrefix + '/lib/cacheManagement/single/Base'),
  ConfigStrategyModel = require(rootPrefix + '/app/models/mysql/config/ConfigStrategy'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement');

/**
 * Class to get active config strategy from cache.
 *
 * @class ConfigStrategy
 */
class ConfigStrategy extends CacheSingleBase {
  /**
   * Init params in oThis.
   *
   * @private
   */
  _initParams() {
    // Nothing to init.
  }

  /**
   * Set use object
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
   * @returns {string}
   */
  _setCacheType() {
    const oThis = this;

    oThis.cacheType = cacheManagementConstants.inMemory;
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

    if (oThis.cacheKey) {
      return oThis.cacheKey;
    }

    oThis.cacheKey = `${oThis._cacheKeyPrefix()}_config_strategy`;

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

    oThis.cacheExpiry = cacheManagementConstants.largeExpiryTimeInterval;

    return oThis.cacheExpiry;
  }

  /**
   * Fetch data from source
   *
   * @return {result}
   */
  async fetchDataFromSource() {
    const configStrategyResponse = await new ConfigStrategyModel().getCompleteConfigStrategy();

    return responseHelper.successWithData(configStrategyResponse.data);
  }
}

module.exports = ConfigStrategy;
