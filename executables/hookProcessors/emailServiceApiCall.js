/**
 * This class is to process hooks specifically related to pepo campaigns.
 *
 * @module executables/hookProcessors/emailServiceApiCall
 */
const program = require('commander');

const rootPrefix = '../..',
  HookProcessorsBase = require(rootPrefix + '/executables/hookProcessors/Base'),
  EmailServiceAPICallHookModel = require(rootPrefix + '/app/models/mysql/big/EmailServiceAPICallHook'),
  AddContact = require(rootPrefix + '/lib/email/hookProcessors/AddContact'),
  RemoveContact = require(rootPrefix + '/lib/email/hookProcessors/RemoveContact'),
  UpdateContactAttributes = require(rootPrefix + '/lib/email/hookProcessors/UpdateContactAttributes'),
  ChangeContactStatus = require(rootPrefix + '/lib/email/hookProcessors/ChangeContactStatus'),
  SendTransactionalMail = require(rootPrefix + '/lib/email/hookProcessors/SendTransactionalMail'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

let ModelKlass;

program.option('--cronProcessId <cronProcessId>', 'Cron table process ID').parse(process.argv);

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node executables/hookProcessors/emailServiceApiCall.js --cronProcessId 1');
  logger.log('');
  logger.log('');
});

const cronProcessId = +program.opts().cronProcessId;

if (!cronProcessId) {
  program.help();
  process.exit(1);
}

/**
 * Class to process hooks related to pepo campaigns.
 *
 * @class EmailServiceApiCall
 */
class EmailServiceApiCall extends HookProcessorsBase {
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
   * Process the hook.
   *
   * @sets oThis.failedHookToBeIgnored
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processHook() {
    const oThis = this;

    const HookProcessorKlass = oThis.getHookProcessorClass(),
      response = await new HookProcessorKlass({ hook: oThis.hook }).perform();

    if (response.isSuccess()) {
      if (response.data.failedHookToBeIgnored) {
        oThis.failedHookToBeIgnored[oThis.hook.id] = response.data;
      } else {
        oThis.successResponse[oThis.hook.id] = response.data;
      }
    } else if (
      response.data.error === 'VALIDATION_ERROR' &&
      response.data.error_message &&
      typeof response.data.error_message === 'object' &&
      response.data.error_message.subscription_status
    ) {
      oThis.failedHookToBeIgnored[oThis.hook.id] = response.data;
    } else {
      oThis.failedHookToBeRetried[oThis.hook.id] = response.data;
    }
  }

  /**
   * Returns the concrete hook processor class.
   *
   * @returns {any}
   */
  getHookProcessorClass() {
    const oThis = this;

    switch (oThis.hook.eventType) {
      case emailServiceApiCallHookConstants.addContactEventType: {
        return AddContact;
      }
      case emailServiceApiCallHookConstants.updateContactAttributeEventType: {
        return UpdateContactAttributes;
      }
      case emailServiceApiCallHookConstants.sendTransactionalEmailEventType: {
        return SendTransactionalMail;
      }
      case emailServiceApiCallHookConstants.removeContactEventType: {
        return RemoveContact;
      }
      case emailServiceApiCallHookConstants.changeContactStatusEventType: {
        return ChangeContactStatus;
      }
      default: {
        throw new Error('Unsupported event type.');
      }
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
        await new EmailServiceAPICallHookModel().markStatusAsProcessed(hookId, oThis.successResponse[hookId]);
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
   *
   * @private
   */
  get _cronKind() {
    return cronProcessesConstants.emailServiceApiCallHookProcessor;
  }

  /**
   *  Hook model class
   *
   * @returns {*}
   */
  get hookModelKlass() {
    if (!ModelKlass) {
      ModelKlass = EmailServiceAPICallHookModel;

      return ModelKlass;
    }

    return ModelKlass;
  }
}

new EmailServiceApiCall({ cronProcessId: +cronProcessId }).perform();

setInterval(function() {
  logger.info('Ending the process. Sending SIGINT.');
  process.emit('SIGINT');
}, cronProcessesConstants.continuousCronRestartInterval);
