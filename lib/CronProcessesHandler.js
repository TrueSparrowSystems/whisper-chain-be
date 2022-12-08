const rootPrefix = '..',
  CronProcessModel = require(rootPrefix + '/app/models/mysql/big/CronProcess'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses');

/**
 * Class for cron process handler.
 *
 * @class CronProcessHandler
 */
class CronProcessHandler {
  /**
   * This function returns the time in the proper format as needed to store in the tables.
   *
   * @param {string/number} timeInEpoch
   *
   * @returns {string}
   * @private
   */
  _convertFromEpochToLocalTime(timeInEpoch) {
    const date = new Date(parseFloat(timeInEpoch));

    return (
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1) +
      '-' +
      date.getDate() +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes() +
      ':' +
      date.getSeconds()
    );
  }

  /**
   * This function validates whether the cron can be started or not.
   *
   * @param {object} params
   * @param {number} params.id
   * @param {string} params.cronKind
   *
   * @returns {Promise<*>}
   */
  async canStartProcess(params) {
    const oThis = this;

    const id = params.id,
      cronKind = params.cronKind;

    // Type validations.
    if (typeof id !== 'number') {
      return Promise.reject(new Error('Cron process id is not a number.'));
    }
    if (typeof cronKind !== 'string') {
      return Promise.reject(new Error('Cron process kind is not a string.'));
    }

    const invertedKind = cronProcessesConstants.invertedKinds[cronKind],
      runningStatus = cronProcessesConstants.runningStatus,
      lastStartTime = oThis._convertFromEpochToLocalTime(Date.now());

    const cronProcessRows = await new CronProcessModel()
      .select('*')
      .where({ id: id, kind: invertedKind })
      .fire();

    // Validate whether process with cronKind and id exists.
    if (cronProcessRows.length === 0) {
      return Promise.reject(new Error('Entry does not exist in cron_processes_table.'));
    }

    const stoppedStatusInt = cronProcessesConstants.invertedStatuses[cronProcessesConstants.stoppedStatus];

    // If status != stopped throw error as process cannot be started.
    if (cronProcessRows[0].status != stoppedStatusInt) {
      logger.error(
        'Can not start the cron as the status of the cron is: ',
        cronProcessesConstants.statuses[cronProcessRows[0].status]
      );
      const errorObject = responseHelper.error({
        internal_error_identifier: cronKind + ':cron_stuck:l_cph_1',
        api_error_identifier: 'cron_stuck',
        debug_options: {
          cronProcessId: id,
          cronKind: cronKind,
          cronStatus: cronProcessesConstants.statuses[cronProcessRows[0].status]
        }
      });

      // Sleep to limit calls to PagerDuty.
      await basicHelper.sleep(30000);

      return Promise.reject(errorObject);
    }
    // Validations done.

    // Define cron_process updateParams.
    const updateParams = {
        id: id,
        kind: cronKind,
        newLastStartTime: lastStartTime,
        newStatus: runningStatus
      },
      cronProcessesResponse = await new CronProcessModel().updateLastStartTimeAndStatus(updateParams);
    // Update entry in cronProcesses table.

    if (cronProcessesResponse.affectedRows === 1) {
      return responseHelper.successWithData(cronProcessRows[0]);
    }

    return Promise.reject(new Error('Cron process update query to mark it started failed to update.'));
  }

  /**
   * Stops process and updates relevant fields in cron_processes.
   *
   * @param {number} id
   *
   * @returns {Promise<void>}
   */
  async stopProcess(id) {
    const oThis = this;

    const cronProcessResp = await new CronProcessModel()
      .select('*')
      .where({ id: id })
      .fire();

    const cronProcess = cronProcessResp[0],
      cronProcessStatus = cronProcessesConstants.statuses[cronProcess.status];

    const params = {
      id: id,
      newLastEndTime: oThis._convertFromEpochToLocalTime(Date.now()),
      newStatus: cronProcessStatus
    };

    if (cronProcessStatus !== cronProcessesConstants.inactiveStatus) {
      params.newStatus = cronProcessesConstants.stoppedStatus;
    }
    await new CronProcessModel().updateLastEndTimeAndStatus(params);
  }
}

module.exports = CronProcessHandler;
