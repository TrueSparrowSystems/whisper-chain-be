const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let invertedKinds, invertedStatuses;

/**
 * Class for cron process constants.
 *
 * @class CronProcesses
 */
class CronProcesses {
  // Cron processes enum kinds start.

  /**
   * Get name for fetch user details cron.
   *
   * @returns {string}
   */
  get fetchUserDetails() {
    return 'fetchUserDetails';
  }

  /**
   * Get name for bg Job Processor cron.
   *
   * @returns {string}
   */
  get bgJobProcessor() {
    return 'bgJobProcessor';
  }

  /**
   *  Get name for cron processes monitor cron.
   *
   * @returns {string}
   */
  get cronProcessesMonitor() {
    return 'cronProcessesMonitor';
  }

  /**
   * Get name for socket job processor cron.
   *
   * @returns {string}
   */
  get socketJobProcessor() {
    return 'socketJobProcessor';
  }

  /**
   * Get name for SMS hook processor cron.
   *
   * @returns {string}
   */
  get smsHookProcessor() {
    return 'smsHookProcessor';
  }

  /**
   * Get name for email hook processor cron.
   *
   * @returns {string}
   */
  get emailServiceApiCallHookProcessor() {
    return 'emailServiceApiCallHookProcessor';
  }

  // Cron processes enum types end.

  // Status enum types start.

  /**
   * Get string value for running status.
   *
   * @returns {string}
   */
  get runningStatus() {
    return 'running';
  }

  /**
   * Get string value for stopped status.
   *
   * @returns {string}
   */
  get stoppedStatus() {
    return 'stopped';
  }

  /**
   * Get string value for inactive status.
   *
   * @returns {string}
   */
  get inactiveStatus() {
    return 'inactive';
  }
  // Status enum types end.

  /**
   * Get kind by enum value.
   *
   * @returns {object}
   */
  get kinds() {
    const oThis = this;

    return {
      '1': oThis.cronProcessesMonitor,
      '2': oThis.bgJobProcessor,
      '3': oThis.socketJobProcessor,
      '4': oThis.fetchUserDetails
    };
  }

  /**
   * Get enum by kind.
   *
   * @returns {object}
   */
  get invertedKinds() {
    const oThis = this;

    invertedKinds = invertedKinds || util.invert(oThis.kinds);

    return invertedKinds;
  }

  /**
   * Get status by enum.
   *
   * @returns {object}
   */
  get statuses() {
    const oThis = this;

    return {
      '1': oThis.runningStatus,
      '2': oThis.stoppedStatus,
      '3': oThis.inactiveStatus
    };
  }

  /**
   * Get enum value by status.
   *
   * @returns {object}
   */
  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }

  // Restart timeouts for crons.

  /**
   * Get continuous cron restart interval.
   *
   * @returns {number}
   */
  get continuousCronRestartInterval() {
    return 30 * 60 * 1000;
  }

  // Cron types based on running time.
  /**
   * Get continuous crons type.
   *
   * @returns {string}
   */
  get continuousCronsType() {
    return 'continuousCrons';
  }

  /**
   * Get periodic crons type.
   *
   * @returns {string}
   */
  get periodicCronsType() {
    return 'periodicCrons';
  }
}

module.exports = new CronProcesses();
