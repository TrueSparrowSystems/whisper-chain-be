const rootPrefix = '../../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  MysqlQueryBuilders = require(rootPrefix + '/lib/queryBuilders/Mysql'),
  util = require(rootPrefix + '/lib/util'),
  mysqlWrapper = require(rootPrefix + '/lib/mysqlWrapper'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  mysqlErrorConstants = require(rootPrefix + '/lib/globalConstant/mysqlErrorConstants');

/**
 * Class for models base.
 *
 * @class ModelBase
 */
class ModelBase extends MysqlQueryBuilders {
  /**
   * Constructor for models base.
   *
   * @param {object} params
   * @param {string} params.dbName
   *
   * @augments MysqlQueryBuilders
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.dbName = params.dbName;
  }

  /**
   * Connection pool to use for read query.
   *
   * @return {*}
   */
  onReadConnection() {
    return mysqlWrapper.getPoolFor(this.dbName, 'slave');
  }

  /**
   * Connection pool to use for write query.
   *
   * @return {*}
   */
  onWriteConnection() {
    return mysqlWrapper.getPoolFor(this.dbName, 'master');
  }

  /**
   * Connection pool to use when host is dynamic
   *
   * @return {*}
   */
  onDynamicHostConnection(dynamicMysqlHost) {
    return mysqlWrapper.getPoolForDynamicHost(this.dbName, 'master', undefined, { host: dynamicMysqlHost });
  }

  /**
   * Fire the query.
   *
   * @return {Promise<any>}
   */
  fire() {
    const oThis = this;

    return new Promise(function(onResolve, onReject) {
      const queryGenerator = oThis.generate();

      return oThis.executeMysqlQuery(onResolve, onReject, queryGenerator, { retryOnDeadlock: true });
    });
  }

  /**
   * Fire the query.
   *
   * @return {Promise<any>}
   */
  fireOnRead() {
    const oThis = this;

    return new Promise(function(onResolve, onReject) {
      const queryGenerator = oThis.generate();

      return oThis.executeMysqlQuery(onResolve, onReject, queryGenerator, { retryOnDeadlock: true, queryOnRead: true });
    });
  }

  /**
   * Raw query for dynamic host.
   *
   * @param {string} query
   *
   * @return {Promise<any>}
   */
  async queryForDynamicHost(dynamicMysqlHost, query) {
    const oThis = this;

    return new Promise(function(onResolve, onReject) {
      const connection = oThis.onDynamicHostConnection(dynamicMysqlHost);
      connection.query(query, {}, function(error, result) {
        if (error) {
          onReject(error);
        } else {
          onResolve(result);
        }
      });
    });
  }

  /**
   * Run the query in mysql.
   *
   * @return {Promise<any>}
   */
  async executeMysqlQuery(onResolve, onReject, queryGenerator, options) {
    const oThis = this,
      preQuery = Date.now();

    let qry;

    if (options.queryOnRead) {
      qry = oThis.onReadConnection();
    } else {
      qry = oThis.onWriteConnection();
    }

    qry = qry.query(queryGenerator.data.query, queryGenerator.data.queryData, async function(err, result, fields) {
      logger.info('(' + (Date.now() - preQuery) + ' ms)', qry.sql);
      if (err) {
        if (options.retryOnDeadlock && ModelBase.isLockDeadlockError(err)) {
          const createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry');

          const errorObject = responseHelper.error({
            internal_error_identifier: 'DEADLOCK_OCCURED_IN_MYSQL',
            api_error_identifier: 'could_not_proceed',
            debug_options: { error: err.toString(), stack: err.stack, query: qry.sql }
          });
          // Notify via emails if deadlocks are happening.
          await createErrorLogsEntry.perform(errorObject, errorLogsConstants.lowSeverity);

          // Note: uncomment to print mysql lock logs. there is a sleep for 50 millisec and await can be skipped for this log
          // oThis.onWriteConnection().query('SHOW ENGINE INNODB STATUS', {}, function(err, result1, fields) {
          //   console.log("SHOW ENGINE INNODB STATUS========",result1);
          // });

          await basicHelper.sleep(50);
          const queryOptions = { retryOnDeadlock: false, queryOnRead: options.queryOnRead };

          return oThis.executeMysqlQuery(onResolve, onReject, queryGenerator, queryOptions);
        }
        onReject(err);
      } else {
        result.defaultUpdatedAttributes = queryGenerator.data.defaultUpdatedAttributes;
        onResolve(result);
      }
    });
  }

  /**
   * Convert Bitwise to enum values.
   *
   * @param {string} bitwiseColumnName
   * @param {number} bitwiseColumnValue
   *
   * @returns {array}
   */
  getBitwiseArray(bitwiseColumnName, bitwiseColumnValue) {
    const oThis = this;
    if (!oThis.bitwiseConfig) {
      throw new Error('Bitwise Config not defined');
    }

    const config = oThis.bitwiseConfig[bitwiseColumnName],
      arr = [];

    if (!config) {
      throw new Error(`Bitwise Config for ${bitwiseColumnValue} not defined`);
    }

    Object.keys(config).forEach((key) => {
      const value = config[key];
      if ((bitwiseColumnValue & key) == key) {
        arr.push(value);
      }
    });

    return arr;
  }

  /**
   * Convert enum to Bitwise values.
   *
   * @param {string} bitwiseColumnName
   * @param {number} bitwiseColumnExistingValue
   * @param {number} bitEnumToSet
   *
   * @return {number}
   */
  setBitwise(bitwiseColumnName, bitwiseColumnExistingValue, bitEnumToSet) {
    const oThis = this;

    if (!oThis.bitwiseConfig) {
      throw new Error('Bitwise Config not defined.');
    }

    const config = oThis.bitwiseConfig[bitwiseColumnName],
      invertedConfig = util.invert(config),
      bitEnumIntegerValue = invertedConfig[bitEnumToSet];

    if (!bitEnumIntegerValue) {
      throw new Error('Invalid enum passed.');
    }

    return bitwiseColumnExistingValue | bitEnumIntegerValue;
  }

  /**
   * Unset enum to Bitwise values.
   *
   * @param {string} bitwiseColumnName
   * @param {number} bitwiseColumnExistingValue
   * @param {number} bitEnumToUnSet
   *
   * @return {number}
   */
  unSetBitwise(bitwiseColumnName, bitwiseColumnExistingValue, bitEnumToUnSet) {
    const oThis = this;

    if (!oThis.bitwiseConfig) {
      throw new Error('Bitwise Config not defined');
    }

    const config = oThis.bitwiseConfig[bitwiseColumnName],
      invertedConfig = util.invert(config),
      bitEnumIntegerValue = invertedConfig[bitEnumToUnSet];

    if (!bitEnumIntegerValue) {
      throw new Error('Invalid enum passed');
    }

    return bitwiseColumnExistingValue & ~bitEnumIntegerValue;
  }

  /**
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return ['id', 'createdAt', 'updatedAt'];
  }

  /**
   * Returns formatted object with columns that can be safely exposed.
   *
   * @param {object} formattedRow
   *
   * @returns {object}
   */
  safeFormattedData(formattedRow) {
    const oThis = this;

    const safeData = {},
      safeFormattedColumnNamesArr = oThis.safeFormattedColumnNames();

    for (let index = 0; index < safeFormattedColumnNamesArr.length; index++) {
      const colName = safeFormattedColumnNamesArr[index];
      safeData[colName] = formattedRow[colName];
    }

    return safeData;
  }

  /**
   * Format final DB data.
   *
   * @param {object} formattedData
   *
   * @returns {object}
   */
  sanitizeFormattedData(formattedData) {
    const oThis = this;

    const finalResponse = {};

    for (const key in formattedData) {
      if (!CommonValidators.isVarUndefined(formattedData[key])) {
        finalResponse[key] = formattedData[key];
      }
    }

    return finalResponse;
  }

  /**
   * Check for duplicate index violation.
   *
   * @param {string} indexName
   * @param {object} mysqlErrorObject
   *
   * @returns {boolean}
   */
  static isDuplicateIndexViolation(indexName, mysqlErrorObject) {
    return (
      mysqlErrorObject.code === mysqlErrorConstants.duplicateError && mysqlErrorObject.sqlMessage.includes(indexName)
    );
  }

  /**
   * Check for duplicate index violation.
   *
   * @param {string} indexName
   * @param {object} mysqlErrorObject
   *
   * @returns {boolean}
   */
  static isLockDeadlockError(mysqlErrorObject) {
    return mysqlErrorObject.code === mysqlErrorConstants.lockDeadlockError;
  }
}

module.exports = ModelBase;
