const Cache = require('@moxiedotxyz/cache');

/**
 * Class for in-memory cache provider.
 *
 * @class InMemoryCacheProvider
 */
class InMemoryCacheProvider {
  /**
   * Get instance of in-memory cache provider.
   *
   * @param {number/string} cacheConsistentBehavior
   *
   * @return {*}
   */
  getInstance(cacheConsistentBehavior) {
    const cacheConfigStrategy = {
      cache: {
        engine: 'none',
        namespace: `Api_${cacheConsistentBehavior}`,
        defaultTtl: 36000,
        consistentBehavior: cacheConsistentBehavior
      }
    };

    return Cache.getInstance(cacheConfigStrategy);
  }
}

module.exports = new InMemoryCacheProvider();
