const Cache = require('@plgworks/unicache');

const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  cacheManagementConstants = require(rootPrefix + '/lib/globalConstant/cacheManagement');

// Declare variables.
const cacheInstanceMap = {};

/**
 * Class for shared memcache provider.
 *
 * @class CacheProvider
 */
class CacheProvider {
  /**
   * Get instance of in memory cache.
   *
   * @param {number} cacheConsistentBehavior
   *
   * @returns {Promise<*>}
   */
  async getInstance(cacheConsistentBehavior) {
    let cacheObject = cacheInstanceMap[cacheConsistentBehavior];
    if (cacheObject) {
      return cacheObject;
    }

    const cacheConfigStrategy = {
      engine: cacheManagementConstants.memcached,
      servers: coreConstants.MEMCACHED_SERVERS,
      defaultTtl: coreConstants.MEMCACHED_DEFAULT_TTL,
      consistentBehavior: coreConstants.MEMCACHED_CONSISTENT_BEHAVIOUR
    };

    cacheObject = Cache.getInstance(cacheConfigStrategy);

    const cacheImplementer = cacheObject.cacheInstance;

    cacheImplementer.client.on('issue', async function(details) {
      const errorMessage = 'Server ' + details.server + ' seems to be down: ' + details.messages.join('');
      logger.error(errorMessage);

      const errorObject = responseHelper.error({
        internal_error_identifier: 'l_cm_m_b_3',
        api_error_identifier: 'service_unavailable',
        debug_options: { errorMessage: errorMessage }
      });
      await createErrorLogsEntry.perform(errorObject, errorLogsConstants.mediumSeverity);
    });

    // eslint-disable-next-line require-atomic-updates
    cacheInstanceMap[cacheConsistentBehavior] = cacheObject;

    return cacheObject;
  }
}

module.exports = new CacheProvider();
