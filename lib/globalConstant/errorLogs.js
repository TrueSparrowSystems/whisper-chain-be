/**
 * Class for error log constants.
 *
 * @class ErrorLogs
 */
class ErrorLogs {
  /**
   * Get high severity string.
   *
   * @return {string}
   */
  get highSeverity() {
    return 'high';
  }

  /**
   * Get medium severity string.
   *
   * @return {string}
   */
  get mediumSeverity() {
    return 'medium';
  }

  /**
   * Get low severity string.
   *
   * @return {string}
   */
  get lowSeverity() {
    return 'low';
  }

  /**
   * Get created status string.
   *
   * @return {string}
   */
  get createdStatus() {
    return 'created';
  }

  /**
   * Get processed status string.
   *
   * @return {string}
   */
  get processedStatus() {
    return 'processed';
  }

  /**
   * Get failed status string.
   *
   * @return {string}
   */
  get failedStatus() {
    return 'failed';
  }

  /**
   * Get completely failed status string.
   *
   * @return {string}
   */
  get completelyFailedStatus() {
    return 'completelyFailed';
  }

  /**
   * Get query limits for severities.
   *
   * @return {{[p: string]: number}}
   */
  get queryLimits() {
    const oThis = this;

    return {
      [oThis.highSeverity]: 100,
      [oThis.mediumSeverity]: 100,
      [oThis.lowSeverity]: 100
    };
  }

  /**
   * Get name for api app.
   *
   * @returns {string}
   */
  get apiAppName() {
    return 'apiApp';
  }

  /**
   * Get all appNames.
   *
   * @returns {string[]}
   */
  get appNames() {
    const oThis = this;

    return [oThis.apiAppName];
  }

  /**
   * Get all severities.
   *
   * @return {string[]}
   */
  get severities() {
    const oThis = this;

    return [oThis.highSeverity, oThis.mediumSeverity, oThis.lowSeverity];
  }
}

module.exports = new ErrorLogs();
