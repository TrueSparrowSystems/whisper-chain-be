const rootPrefix = '../..',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class for sigint handler.
 *
 * This class has following responsibilities of SIGINT handling.
 *
 * @class CronBase
 */
class CronBase {
  /**
   * Constructor for sigint handler.
   *
   * @constructor
   */
  constructor() {
    const oThis = this;

    oThis.cronStarted = false;
    oThis.stopPickingUpNewWork = false;
    oThis.releaseLockFunction = null;

    oThis._attachHandlers(); // Attaching handlers from sigint handler.
  }

  /**
   * Main performer method for the class.
   *
   * @returns {Promise<>}
   */
  perform() {
    const oThis = this;

    return oThis.asyncPerform().catch(async function(err) {
      oThis.canExit = true;

      logger.log('Marked can exit as true in cron Base catch block.');

      // If asyncPerform fails, run the below catch block.
      logger.error('Error in executables/CronBase.js: ', err);
      process.emit('SIGINT');
    });
  }

  /**
   * Async performer.
   *
   * @returns {Promise<void>}
   */
  async asyncPerform() {
    const oThis = this;

    await oThis._start();
  }

  /**
   * Attach SIGINT/SIGTERM handlers to the current process.
   */
  _attachHandlers() {
    const oThis = this;

    /**
     * Handler for SIGINT and SIGTERM signals.
     */
    const handle = async function() {
      if (!oThis.cronStarted) {
        process.exit(1);
      }

      await oThis._customHandle();
      oThis._stopPickingUpNewTasks();

      // Sleep to give some breathing space to cancel consume. So by chance if during cancellation new message arrives, it gets considered.
      await basicHelper.sleep(1000);

      if (oThis._pendingTasksDone()) {
        logger.info(':: No pending tasks. Changing the status ');

        if (oThis.releaseLockFunction) {
          try {
            oThis.releaseLockFunction();
          } catch (err) {
            // Nothing to do
          }
        }
        // Sleep to give some time breathing place to releasing lock
        await basicHelper.sleep(1000);
        process.exit(0);
      } else {
        logger.info(':: There are pending tasks. Waiting for completion.');
        setTimeout(handle, 500);
      }
    };

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
  }

  /**
   * Stops consumption upon invocation
   */
  _stopPickingUpNewTasks() {
    const oThis = this;

    logger.info(':: _stopPickingUpNewTasks called');

    oThis.stopPickingUpNewWork = true;
  }

  /**
   * Custom handle
   *
   * @returns {Promise<void>}
   * @private
   */
  async _customHandle() {
    // Nothing to do
  }

  /**
   * Start cron process
   *
   * @private
   */
  async _start() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * This function provides info whether the process has to exit.
   *
   * @private
   */
  _pendingTasksDone() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = CronBase;
