/**
 * This class is to process hooks for sending sms
 *
 * @module executables/hookProcessors/sms
 */
const program = require('commander');

const rootPrefix = '../..',
  SmsHookProcessor = require(rootPrefix + '/lib/sms/HookProcessor'),
  HookProcessorsBase = require(rootPrefix + '/executables/hookProcessors/Base'),
  SmsHookModel = require(rootPrefix + '/app/models/mysql/big/SmsHook'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses');

program.option('--cronProcessId <cronProcessId>', 'Cron table process ID').parse(process.argv);

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node executables/hookProcessors/sms.js --cronProcessId 33');
  logger.log('');
  logger.log('');
});

const cronProcessId = +program.opts().cronProcessId;

if (!cronProcessId) {
  program.help();
  process.exit(1);
}

/**
 * Class to process sms hooks
 *
 * @class SmsHookProcessorExecutable
 */
class SmsHookProcessorExecutable extends HookProcessorsBase {
  /**
   * Run validations on input parameters.
   *
   * @return {Promise<void>}
   * @private
   */
  async _validateAndSanitize() {
    // Do nothing.
  }

  /**
   * Function which will process the hook.
   *
   * @sets oThis.successResponse, oThis.failedHookToBeIgnored
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processHook() {
    const oThis = this;

    const response = await new SmsHookProcessor({ hook: oThis.hook }).perform();

    if (response.isSuccess()) {
      oThis.successResponse[oThis.hook.id] = response.data;
    } else {
      oThis.failedHookToBeIgnored[oThis.hook.id] = response.data;
    }
  }

  /**
   * Function which will mark the hook processed.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _updateStatusToProcessed() {
    const oThis = this;

    for (const hookId in oThis.hooksToBeProcessed) {
      if (oThis.successResponse[hookId]) {
        const serviceMessageId = oThis.successResponse[hookId].serviceMessageId;
        await new SmsHookModel().markStatusAsProcessed(hookId, serviceMessageId);
      }
    }
  }

  /**
   * This function provides info whether the process has to exit.
   *
   * @returns {boolean}
   *
   * @private
   */
  _pendingTasksDone() {
    const oThis = this;

    return oThis.canExit;
  }

  /**
   * Get cron kind.
   *
   * @returns {string}
   * @private
   */
  get _cronKind() {
    return cronProcessesConstants.smsHookProcessor;
  }

  /**
   *  Hook model class
   *
   * @returns {*}
   */
  get hookModelKlass() {
    return SmsHookModel;
  }
}

new SmsHookProcessorExecutable({ cronProcessId: +cronProcessId }).perform();

setInterval(function() {
  logger.info('Ending the process. Sending SIGINT.');
  process.emit('SIGINT');
}, cronProcessesConstants.continuousCronRestartInterval);
