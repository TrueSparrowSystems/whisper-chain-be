/**
 * Class for background job constants.
 *
 * @class BgJobConstants
 */
class BgJobConstants {
  // Topics start.
  // Example:
  // get testRabbitMqTopic() {
  //   return 'bg.p1.testRabbitMqTopic';
  // }

  /**
   * Get topic name for get all users bgjob.
   *
   * @returns {string}
   */
  get getAllUsersTopic() {
    return 'bg.p1.getAllUsersTopic';
  }
  // Topics end.
}

module.exports = new BgJobConstants();
