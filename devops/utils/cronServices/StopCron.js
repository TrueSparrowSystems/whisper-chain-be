const rootPrefix = '../../..',
  CronProcessModel = require(rootPrefix + '/app/models/mysql/big/CronProcess'),
  CronProcessesHandler = require(rootPrefix + '/lib/CronProcessesHandler'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class to mark cron stopped
 *
 * @class
 */
class StopCron {
  /**
   * Constructor
   *
   * @constructor
   */
  constructor(ids) {
    const oThis = this;

    oThis.ids = ids;
    oThis.status = cronProcessesConstants.stoppedStatus;
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<result>}
   */
  perform() {
    const oThis = this;

    return oThis._asyncPerform().catch((error) => {
      if (responseHelper.isCustomResult(error)) {
        return error;
      }
      logger.error('devops/utils/StopCron.js::perform::catch', error);

      return oThis._getRespError('do_u_cs_uc_p1');
    });
  }

  /**
   * Async perform
   * @return {Promise<result>}
   */
  async _asyncPerform() {
    const oThis = this;

    const rowData = await new CronProcessModel().getById(oThis.ids);
    if (rowData.length < 1) {
      return oThis._getRespError('do_u_cs_uc_ap1');
    }

    const idsToBeUpdated = [];
    for (let index = 0; index < rowData.length; index++) {
      if (rowData[index].status !== cronProcessesConstants.invertedStatuses[oThis.status]) {
        idsToBeUpdated.push(rowData[index].id);
      }
    }

    for (let index = 0; index < idsToBeUpdated.length; index++) {
      await new CronProcessModel().updateLastEndTimeAndStatus({
        newLastEndTime: new CronProcessesHandler()._convertFromEpochToLocalTime(Date.now()),
        id: idsToBeUpdated[index],
        newStatus: oThis.status
      });
    }

    return Promise.resolve(responseHelper.successWithData({}));
  }

  /**
   * Generate error response.
   *
   * @param {string} code: Error internal identifier
   *
   * @returns {Promise<void>}
   * @private
   */
  async _getRespError(code) {
    return responseHelper.error({
      internal_error_identifier: code,
      api_error_identifier: 'something_went_wrong',
      debug_options: {}
    });
  }
}

module.exports = StopCron;
