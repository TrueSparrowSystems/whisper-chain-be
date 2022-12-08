/**
 * Class for job constants.
 *
 * @class JobConstants
 */
class JobConstants {
  /**
   * Returns true for allowed publish after times for jobs.
   *
   * @returns {number}
   */
  get allowedPublishedAfterTimes() {
    return {
      // 1000: 1, // 1s
    };
  }
}

module.exports = new JobConstants();
