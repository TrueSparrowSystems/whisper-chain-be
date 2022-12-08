const CassandraClient = require('cassandra-driver');

const rootPrefix = '../../..',
  coreConstants = require(rootPrefix + '/config/coreConstants');

// Declare variables.
let defaultConsistencyInteger = null;

/**
 * Class for cassandra constants.
 *
 * @class CassandraConstants
 */
class CassandraConstants {
  /**
   * Returns consistent level.
   *
   * @returns {number}
   */
  get defaultConsistencyLevel() {
    const consistencyLevelString = coreConstants.CASSANDRA_REPLICATION_LEVEL;

    defaultConsistencyInteger =
      defaultConsistencyInteger || CassandraClient.valueOf().types.consistencies[consistencyLevelString];

    return defaultConsistencyInteger;
  }
}

module.exports = new CassandraConstants();
