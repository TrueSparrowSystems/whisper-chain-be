const rootPrefix = '..',
  cassandraWrapper = require(rootPrefix + '/lib/cassandraWrapper'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class to execute cassandra migration & seed query.
 *
 * @class ExecuteCassandraQuery
 */
class ExecuteCassandraQuery {
  /**
   * Constructor to execute cassandra migration & seed query.
   *
   * @param {string} keySpace
   * @param {string} cassandraQuery
   *
   * @constructor
   */
  constructor(keySpace, cassandraQuery) {
    const oThis = this;

    oThis.keySpace = keySpace;
    oThis.cassandraQuery = cassandraQuery;
  }

  /**
   * Execute the query and return the query response. Also, tries to create keyspace if not present.
   *
   * @return {object}
   */
  async perform() {
    const oThis = this;

    // Create DB if not present
    const dbCreationStatement =
      'CREATE KEYSPACE IF NOT EXISTS ' +
      oThis.keySpace +
      ' WITH replication ={' +
      "'class'" +
      ":'" +
      coreConstants.CASSANDRA_REPLICATION_CLASS +
      "'," +
      "'replication_factor'" +
      ":'" +
      coreConstants.CASSANDRA_REPLICATION_FACTOR +
      "'};";

    logger.log(dbCreationStatement);

    // Removed params and options (prepare: true), as AWS keyspaces doesn't support them for DDL statements
    // Ref: https://docs.aws.amazon.com/keyspaces/latest/devguide/functional-differences.html#functional-differences.prepared-statements
    await cassandraWrapper.execute(dbCreationStatement);

    await oThis.checkKeyspaceIsAvailable();

    // Execute the cassandra query.
    const queryResult = await cassandraWrapper.execute(oThis.cassandraQuery);
    logger.log(oThis.cassandraQuery);

    return queryResult;
  }

  /**
   * Allow migration to be continued only if keyspace is generated and available.
   *
   * @returns {Promise<void>}
   */
  async checkKeyspaceIsAvailable() {
    const oThis = this;

    const checkQueryStatement = "SELECT * FROM system_schema.keyspaces where keyspace_name='" + oThis.keySpace + "';";

    for (let index = 0; index < 10; index++) {
      await basicHelper.sleep(1000);
      const result = await cassandraWrapper.execute(checkQueryStatement);

      if (result.rowLength > 0) {
        return;
      }
    }

    // If keyspace is not available, stop execution.
    throw new Error('Keyspace - ' + oThis.keySpace + ' could not be available');
  }
}

module.exports = ExecuteCassandraQuery;
