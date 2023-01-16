const program = require('commander');

const rootPrefix = '../..',
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node lib/cron/sampleCron.js    ');
  logger.log('');
  logger.log('');
});

/**
 * Class for basic cron working reference.
 *
 * @class SampleJob
 */
class SampleJob extends CronBase {
  /**
   * Constructor to print sample job.
   *
   * @augments SampleJob
   *
   * @constructor
   */
  constructor() {
    super();

    const oThis = this;

    oThis.canExit = true;
  }

  /**
   * Start the executable.
   *
   * @sets oThis.canExit
   *
   * @returns {Promise<any>}
   * @private
   */
  async _start() {
    const oThis = this;

    oThis.cronStarted = true;
    oThis.canExit = false;

    await oThis._printMessage();

    oThis.canExit = true;

    return responseHelper.successWithData({});
  }

  /**
   * Execute the task.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _printMessage() {
    for (let index = 0; index < 10; index++) {
      console.log('Job Number-> ', index);

      await basicHelper.sleep(2000);
    }
  }

  /**
   * This function provides info whether the process has to exit.
   *
   * @returns {boolean}
   * @private
   */
  _pendingTasksDone() {
    const oThis = this;

    return oThis.canExit;
  }
}

const cronSampleJob = new SampleJob();

cronSampleJob
  .perform()
  .then(function() {
    logger.step('** Exiting process');
    logger.info('Cron last run at: ', Date.now());
    process.emit('SIGINT');
  })
  .catch(function(err) {
    logger.error('** Exiting process due to Error: ', err);
    process.emit('SIGINT');
  });
