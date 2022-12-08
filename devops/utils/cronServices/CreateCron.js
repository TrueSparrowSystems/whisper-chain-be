const fs = require('fs');

const rootPrefix = '../../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  InsertCrons = require(rootPrefix + '/lib/cronProcess/InsertCrons');

/**
 * Class to create new cron
 *
 * @class
 */
class CreateCron {
  /**
   * Constructor
   *
   * @param {String} inputJsonFile: Input JSON file path
   * @param {String} outputJsonFile:  Output JSON file path
   *
   * @constructor
   */
  constructor(inputJsonFile, outputJsonFile) {
    const oThis = this;
    oThis.jsonData = require(inputJsonFile);
    oThis.outputFile = outputJsonFile;
  }

  /**
   *
   * Perform
   *
   * @return {Promise<result>}
   *
   */
  perform() {
    const oThis = this;

    return oThis._asyncPerform().catch((error) => {
      if (responseHelper.isCustomResult(error)) {
        return error;
      }
      logger.error('/lib/cronProcess/InsertCrons::perform::catch', error, error.stack);

      return oThis._getRespError('do_u_cs_cc_p1');
    });
  }

  /**
   * Async perform
   *
   * @return {Promise<result>}
   */
  async _asyncPerform() {
    const oThis = this;

    for (let i = 0; i < oThis.jsonData.length; i += 1) {
      const cron = oThis.jsonData[i],
        dbParams = cron.db_params;

      if (!cron.identifier && dbParams) {
        const result = await new InsertCrons({
          cronKindName: dbParams.kind,
          cronParams: dbParams.cron_params
        }).perform();

        if (result.insertId) {
          cron.identifier = result.insertId;
        }
      }
    }

    fs.writeFileSync(oThis.outputFile, JSON.stringify(oThis.jsonData));

    return responseHelper.successWithData({ outputJson: oThis.jsonData });
  }

  /**
   * Generate Error response
   *
   * @param code {String} - Error internal identifier
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

module.exports = CreateCron;
