const rootPrefix = '../../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  cassandraClient = require(rootPrefix + '/lib/cassandraWrapper'),
  cassandraConstants = require(rootPrefix + '/lib/globalConstant/cassandra/cassandra');

/**
 * Class for cassandra model base.
 *
 * @class CassandraModelBase
 */
class CassandraModelBase {
  /**
   * Constructor for cassandra model base.
   *
   * @param {object} params
   * @param {string} params.keyspace - Cassandra Keyspace.
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.keyspace = params.keyspace;
  }

  /**
   * Connection pool to use for write query.
   *
   * @returns {*}
   */
  onWriteConnection() {
    return cassandraClient;
  }

  /**
   * Table name with keyspace.
   *
   * @returns {string}
   */
  get queryTableName() {
    const oThis = this;

    return `${oThis.keyspace}.${oThis.tableName}`;
  }

  /**
   * Get default options.
   *
   * @param {object} [options]
   * @param {boolean} [options.prepare]
   * @param {number} [options.consistency]
   *
   * @returns {object}
   */
  getOptions(options = {}) {
    options.prepare = CommonValidators.isVarNullOrUndefined(options.prepare) ? true : options.prepare;
    options.consistency = options.consistency || cassandraConstants.defaultConsistencyLevel;

    return options;
  }

  /**
   * Fire the query.
   *
   * @param {string} query
   * @param {array} [params]
   * @param {object} [options]
   *
   * @returns {Promise<any>}
   */
  async fire(query, params = [], options = {}) {
    const oThis = this;

    return oThis.onWriteConnection().execute(query, params, oThis.getOptions(options));
  }

  /**
   * Batch fire the query.
   *
   * @param {array} queries
   * @param {array} [params]
   * @param {object} [options]
   *
   * @returns {Promise<any>}
   */
  async batchFire(queries, params = [], options = {}) {
    const oThis = this;

    return oThis.onWriteConnection().batch(queries, params, oThis.getOptions(options));
  }

  /**
   * Batch fire the query.
   *
   * @param {string} query
   * @param {array} [params]
   * @param {object} [options]
   * @param {object} [rowCallback]
   * @param {object} [endCallback]
   *
   * @returns {Promise<any>}
   */
  async eachRow(query, params = [], options = {}, rowCallback, endCallback) {
    const oThis = this;

    return oThis.onWriteConnection().eachRow(query, params, oThis.getOptions(options), rowCallback, endCallback);
  }

  /**
   * Format final DB data.
   *
   * @param {object} formattedData
   *
   * @returns {object}
   */
  sanitizeFormattedData(formattedData) {
    const finalResponse = {};

    for (const key in formattedData) {
      if (!CommonValidators.isVarUndefined(formattedData[key])) {
        finalResponse[key] = formattedData[key];
      }
    }

    return finalResponse;
  }

  /**
   * Key object defined in cassandra table.
   */
  keyObject() {
    throw new Error(
      'Model has to define key object for itself. eg: {partition: ["user_id"], sort: ["updated_timestamp"]}'
    );
  }
}

module.exports = CassandraModelBase;
