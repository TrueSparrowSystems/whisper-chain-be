const rootPrefix = '..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cassandraProvider = require(rootPrefix + '/lib/providers/cassandra'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs');

/**
 * Class for cassandra-driver wrapper.
 *
 * @class CassandraSdkWrapper
 */
class CassandraSdkWrapper {
  /**
   * Initialize cassandra object.
   *
   * @sets oThis.client
   *
   * @returns {Promise<void>}
   * @private
   */
  async _initializeCassandraObj() {
    const oThis = this;

    oThis.client = await cassandraProvider.getInstance();

    oThis._subscribeForLogging();
  }

  /**
   * Method to log cassandra logs.
   *
   * @private
   */
  _subscribeForLogging() {
    const oThis = this;

    oThis.client.on('log', function(level, className, message, furtherInfo) {
      const msg = `cassandra log event: ${level} -- ${message}`;

      switch (level) {
        case 'info': {
          break;
        }
        case 'warning': {
          logger.warn('l_cw_2', msg);
          break;
        }
        case 'error': {
          logger.error('l_cw_3', msg);
          const errorObject = responseHelper.error({
            internal_error_identifier: 'l_cw_3',
            api_error_identifier: 'something_went_wrong',
            debug_options: {
              message: message,
              className: className,
              furtherInfo: furtherInfo
            }
          });

          createErrorLogsEntry.perform(errorObject, errorLogsConstants.highSeverity);
          break;
        }
        case 'verbose': {
          break;
        }
        default: {
          logger.log(`Current level: ${level}.--${msg}`);
          break;
        }
      }
    });
  }

  /**
   * Method to run a single cassandra query.
   *
   * @param {string} query
   * @param {object} params
   * @param {object} [options]
   *
   * @returns {Promise<*>}
   */
  async execute(query, params, options = {}) {
    const oThis = this;

    if (!oThis.client) {
      await oThis._initializeCassandraObj();
    }

    const preQuery = Date.now();

    return new Promise(function(resolve, reject) {
      oThis.client
        .execute(query, params, options)
        .then((response) => {
          logger.info('(' + (Date.now() - preQuery) + ' ms)', query, params);

          return resolve(response);
        })
        .catch((err) => {
          logger.debug('Error in execute cassandra query: ', err);
          logger.error(query, params);
          reject(err);
        });
    });
  }

  /**
   * Method to run batch multiple statements.
   *
   * @param {array<string>} queries
   * @param {object} params
   * @param {object} [options]
   *
   * @returns {Promise<*>}
   */
  async batch(queries, params, options = {}) {
    const oThis = this;

    if (!oThis.client) {
      await oThis._initializeCassandraObj();
    }

    const preQuery = Date.now();

    return new Promise(function(resolve, reject) {
      oThis.client
        .batch(queries, options)
        .then((response) => {
          logger.info('(' + (Date.now() - preQuery) + ' ms)', queries, params);

          return resolve(response);
        })
        .catch((err) => {
          logger.debug('Error in batch cassandra query: ', err);
          logger.error(queries, params);
          reject(err);
        });
    });
  }

  /**
   * Method to run a single cassandra query.
   *
   * @param {string} query
   * @param {object} params
   * @param {object} [options]
   * @param {function} [rowCallback]
   *
   * @returns {Promise<*>}
   */
  async eachRow(query, params, options = {}, rowCallback) {
    const oThis = this;

    if (!oThis.client) {
      await oThis._initializeCassandraObj();
    }

    const rawRows = [];

    const preQuery = Date.now();

    return new Promise(function(resolve, reject) {
      oThis.client.eachRow(
        query,
        params,
        options,
        function(number, row) {
          logger.debug('Row no:', number, ' fetched');
          logger.debug('Row:', row);

          rawRows.push(row);

          if (rowCallback) {
            // Note: To use callback row formatting logic should be handled by the callback function,
            // End callback will always return the raw rows received from Cassandra.
            rowCallback(number, row);
          }
        },
        function(err, result) {
          logger.debug('End Cassandra Callback.');
          logger.info('(' + (Date.now() - preQuery) + ' ms)', query, params);

          if (err) {
            logger.error('lcw_er_1: Error in cassandra-', err);
            logger.error(query, params);

            return reject(err);
          }
          // Note: rows is always the raw data received from Cassandra.
          result.rows = rawRows;

          return resolve(result);
        }
      );
    });
  }
}

module.exports = new CassandraSdkWrapper();
