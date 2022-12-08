const rootPrefix = '../..',
  CronBase = require(rootPrefix + '/executables/CronBase'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class for hook processor base.
 *
 * @class HookProcessorsBase
 */
class HookProcessorsBase extends CronBase {
  /**
   * Constructor for hook processor base.
   *
   * @param {object} params
   * @param {number} params.cronProcessId
   * @param {boolean} [params.processFailed] - boolean tells if this iteration is to retry failed hooks or to process fresh ones.
   *
   * @augments CronBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.processFailed = params.processFailed;

    oThis.lockIdentifier = Number(basicHelper.getCurrentTimestampInSeconds() + '.' + process.pid);

    oThis.hook = null;
    oThis.hooksToBeProcessed = {};
    oThis.successResponse = {};
    oThis.failedHookToBeRetried = {};
    oThis.failedHookToBeIgnored = {};

    oThis.processableHooksPresentFlag = true;
    oThis.canExit = true;
  }

  /**
   * Start cron.
   *
   * @sets oThis.canExit
   *
   * @returns {Promise<void>}
   * @private
   */
  async _start() {
    const oThis = this;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (oThis.stopPickingUpNewWork && oThis._pendingTasksDone()) {
        oThis.canExit = true;
        break;
      }

      oThis.canExit = false;
      // Acquire lock.
      await oThis._acquireLock();

      if (oThis.processableHooksPresentFlag) {
        logger.log('Processing hooks...');

        // Fetch the locked hooks.
        await oThis._fetchLockedHooks();

        // Process these hooks.
        await oThis._processHooks();

        // Mark hooks as processed.
        await oThis._updateStatusToProcessed();

        // For hooks which failed, mark them as failed.
        await oThis._releaseLockAndUpdateStatusForNonProcessedHooks();
      } else {
        logger.log('No processable hook present..');
        logger.log('Sleeping Now...');
        await basicHelper.sleep(5000);
      }

      oThis.canExit = true;
    }
  }

  /**
   * Acquire lock.
   *
   * @sets oThis.processableHooksPresentFlag
   *
   * @returns {Promise<void>}
   * @private
   */
  async _acquireLock() {
    const oThis = this;

    if (oThis.processFailed) {
      // Acquire lock on failed hooks.
      const acquireLockResponse = await oThis._acquireLockOnFailedHooks();
      if (acquireLockResponse.affectedRows === 0) {
        oThis.processableHooksPresentFlag = false;

        return;
      }
    } else {
      // Acquire lock on fresh hooks.
      const acquireLockResponse = await oThis._acquireLockOnFreshHooks();
      if (acquireLockResponse.affectedRows === 0) {
        oThis.processableHooksPresentFlag = false;

        return;
      }
    }

    oThis.processableHooksPresentFlag = true;
  }

  /**
   * Fetch locked hooks for processing.
   *
   * @sets oThis.hooksToBeProcessed
   *
   * @returns {Promise<void>}
   * @private
   */
  async _fetchLockedHooks() {
    const oThis = this;

    const ModelKlass = oThis.hookModelKlass;

    oThis.hooksToBeProcessed = await new ModelKlass().fetchLockedHooks(oThis.lockIdentifier);
  }

  /**
   * Process the fetched hooks.
   *
   * @sets oThis.hook
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processHooks() {
    const oThis = this;

    for (const hookId in oThis.hooksToBeProcessed) {
      oThis.hook = oThis.hooksToBeProcessed[hookId];

      await oThis._processHook().catch(function(err) {
        logger.error('The err is : ', err);
        oThis.failedHookToBeRetried[oThis.hook.id] = {
          exception: err
        };
      });
    }
  }

  /**
   * Acquire lock on fresh hooks.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _acquireLockOnFreshHooks() {
    const oThis = this;

    const ModelKlass = oThis.hookModelKlass;

    return new ModelKlass().acquireLocksOnFreshHooks(oThis.lockIdentifier);
  }

  /**
   * Acquire lock on failed hooks.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _acquireLockOnFailedHooks() {
    const oThis = this;

    const ModelKlass = oThis.hookModelKlass;

    return new ModelKlass().acquireLocksOnFailedHooks(oThis.lockIdentifier);
  }

  /**
   * Release lock and update status for non processed hooks.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _releaseLockAndUpdateStatusForNonProcessedHooks() {
    const oThis = this;

    const ModelKlass = oThis.hookModelKlass;

    for (const hookId in oThis.hooksToBeProcessed) {
      const failedCount = oThis.hooksToBeProcessed[hookId].retryCount;

      if (oThis.failedHookToBeRetried[hookId]) {
        logger.info(
          `Base::_releaseLockAndUpdateStatusForNonProcessedHooks::${
            oThis.hook.id
          }, marking hook failedHookToBeRetried, failedCount::${failedCount}`
        );
        await new ModelKlass().markFailedToBeRetried(hookId, failedCount, oThis.failedHookToBeRetried[hookId]);
      }

      if (oThis.failedHookToBeIgnored[hookId]) {
        await new ModelKlass().markFailedToBeIgnored(hookId, failedCount, oThis.failedHookToBeIgnored[hookId]);
      }
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

  /**
   * Update status to processed.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _updateStatusToProcessed() {
    throw new Error('Sub-class to implement');
  }

  /**
   * Process hook.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processHook() {
    throw new Error('Sub-class to implement');
  }
}

module.exports = HookProcessorsBase;
