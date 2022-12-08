const CassandraClient = require('cassandra-driver');

const rootPrefix = '../..',
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

/**
 * Class for cassandra provider.
 *
 * @class Cassandra
 */
class Cassandra {
  /**
   * Get instance method of cassandra.
   *
   * @returns {Promise<*>}
   */
  async getInstance() {
    const configStrategyProvider = require(rootPrefix + '/lib/providers/configStrategy');

    const cassandraConfigResponse = await configStrategyProvider.getConfigForKind(configStrategyConstants.cassandra);

    if (cassandraConfigResponse.isFailure()) {
      return cassandraConfigResponse;
    }

    const cassandraConfig = cassandraConfigResponse.data[configStrategyConstants.cassandra];

    const cassandraConfigStrategy = {
      contactPoints: cassandraConfig.contactPoints,
      localDataCenter: cassandraConfig.localDataCenter,
      authProvider: new CassandraClient.auth.PlainTextAuthProvider(cassandraConfig.username, cassandraConfig.password),
      encoding: { set: Set }
    };

    return new CassandraClient.Client(cassandraConfigStrategy);
  }
}

module.exports = new Cassandra();
