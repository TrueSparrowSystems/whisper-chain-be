/**
 * Class for machine kind constants.
 *
 * @class MachineKindConstants
 */
class MachineKindConstants {
  /**
   * Get RMQ options for machine kind.
   *
   * @param {string} machineKind
   *
   * @return {*}
   */
  rmqOptionsFor(machineKind) {
    const oThis = this;

    if (machineKind === oThis.cronKind) {
      return {
        connectionTimeoutSec: oThis.cronRmqWaitTimeout,
        switchHostAfterSec: oThis.cronRmqSwitchTimeout
      };
    } else if (machineKind === oThis.appServerKind) {
      return {
        connectionTimeoutSec: oThis.appServerRmqWaitTimeout,
        switchHostAfterSec: oThis.appServerRmqSwitchTimeout
      };
    }

    return Promise.reject(new Error('unrecognized machine kind machineKind.'));
  }

  // Machine kinds start.
  /**
   * Get string for cron machine kind.
   *
   * @returns {string}
   */
  get cronKind() {
    return 'cronKind';
  }

  /**
   * Get string for app server kind.
   *
   * @returns {string}
   */
  get appServerKind() {
    return 'appServerKind';
  }
  // Machine kinds end.

  /**
   * Get connection wait timeout for app server machine.
   *
   * @returns {number}
   */
  get appServerRmqWaitTimeout() {
    return 30;
  }

  /**
   * Get connection wait timeout for cron machine.
   *
   * @returns {number}
   */
  get cronRmqWaitTimeout() {
    return 3600;
  }

  /**
   * Connection switch timeout for app server machine.
   *
   * @returns {number}
   */
  get appServerRmqSwitchTimeout() {
    return 5;
  }

  /**
   * Connection switch timeout for cron machine.
   *
   * @returns {number}
   */
  get cronRmqSwitchTimeout() {
    return 5;
  }
}

module.exports = new MachineKindConstants();
