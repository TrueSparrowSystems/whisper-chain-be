const rootPrefix = '../..',
  ErrorLogs = require(rootPrefix + '/app/models/mysql/big/ErrorLogs'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs');

/**
 * Class to create entry in error_logs table.
 *
 * @class CreateEntry
 */
class CreateEntry {
  /**
   * Performer method for class.
   *
   * @param {object} errorObject
   * @param {string} [severity]: defaults to high.
   * @param {string} [options]: options
   * @param {string} [options.appName]: name of app
   * @param {array} [options.emailIds]: email ids
   *
   * @return {Promise<void>}
   */
  perform(errorObject, severity, options = {}) {
    const oThis = this;

    return oThis._asyncPerform(errorObject, severity, options).catch(function(error) {
      if (responseHelper.isCustomResult(error)) {
        return error;
      }
      logger.error(`${__filename}::perform::catch`);
      logger.error(error);

      return responseHelper.error({
        internal_error_identifier: 'l_el_ce_1',
        api_error_identifier: 'unhandled_catch_response',
        debug_options: { error: error.toString(), stack: error.stack }
      });
    });
  }

  /**
   * Async performer.
   *
   * @param {object} errorObject
   * @param {string} severity
   * @param {string} [options]: options
   * @param {string} [options.appName]: name of app
   * @param {string} [options.emailIds]: email ids
   *
   * @return {Promise<void>}
   */
  async _asyncPerform(errorObject, severity, options = {}) {
    const oThis = this;

    const appName = options.appName || null;
    const emailIds = options.emailIds || [];
    const inputParams = CreateEntry._validateInputParams(errorObject, severity, appName, emailIds);

    oThis._setVariables(inputParams.appName);

    await oThis._insertEntry(inputParams.severity, inputParams.kind, inputParams.data);
  }

  /**
   * Validate input parameters.
   *
   * @param {object} errorObject
   * @param {string} severity
   * @param {string} [appName]: application name.
   * @param {array} [emailIds]: email ids.
   *
   * @returns {*}
   * @private
   */
  static _validateInputParams(errorObject, severity, appName, emailIds) {
    const kind = errorObject.internalErrorCode;
    let data = errorObject.getDebugData({});

    if (emailIds.length > 0) {
      data.emailIds = emailIds;
    }

    data = JSON.stringify(data, function(key, val) {
      // eslint-disable-next-line no-undefined
      return val === undefined ? null : val;
    });

    if (!severity) {
      logger.error('Severity not sent. Setting as high.');
      severity = errorLogsConstants.highSeverity;
    }

    if (!kind || !data) {
      logger.error('Mandatory parameters missing. Please send correct error object.');

      return Promise.reject(new Error('Mandatory parameters missing. Please send correct error object.'));
    }

    if (!(typeof severity === 'string') || !(typeof kind === 'string')) {
      return Promise.reject(new TypeError('Data types of severity and kind should be string.'));
    }

    if (!errorLogsConstants.severities.includes(severity)) {
      return Promise.reject(new Error('Invalid severity.'));
    }

    if (appName && !errorLogsConstants.appNames.includes(appName)) {
      return Promise.reject(new Error(`Invalid appName.-${appName}`));
    }

    return {
      severity: severity,
      kind: kind,
      data: data,
      appName: appName
    };
  }

  /**
   * Set variables from core environment variables.
   *
   * @sets oThis.envIdentifier, oThis.appName, oThis.ipAddress
   *
   * @private
   */
  _setVariables(appName) {
    const oThis = this;

    oThis.envIdentifier = coreConstants.ENV_IDENTIFIER;
    oThis.appName = appName || coreConstants.APP_NAME;
    oThis.ipAddress = coreConstants.IP_ADDRESS;
  }

  /**
   * Insert entry in error_logs table.
   *
   * @param {string} severity
   * @param {string} kind
   * @param {string} data
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _insertEntry(severity, kind, data) {
    const oThis = this;

    const currentTime = new Date();

    await new ErrorLogs()
      .insert({
        app: oThis.appName,
        env_id: oThis.envIdentifier,
        severity: severity,
        machine_ip: oThis.ipAddress,
        kind: kind,
        data: data,
        status: errorLogsConstants.createdStatus,
        created_at: currentTime,
        updated_at: currentTime
      })
      .fire();

    logger.log('Entry created successfully in error_logs table.');
  }
}

module.exports = new CreateEntry();
