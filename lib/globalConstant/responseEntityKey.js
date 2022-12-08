/**
 * Class for response entity key constants.
 *
 * @class ResponseEntityKeyConstants
 */
class ResponseEntityKeyConstants {
  /**
   * Get response key for entity type user ids.
   *
   * @returns {string}
   */
  get userIds() {
    return 'user_ids';
  }

  /**
   * Get response key for entity type users map.
   *
   * @returns {string}
   */
  get users() {
    return 'users';
  }

  /**
   * Get response key for meta entities.
   *
   * @returns {string}
   */
  get meta() {
    return 'meta';
  }

  /**
   * Get response key for entity type upload params.
   *
   * @returns {string}
   */
  get uploadParams() {
    return 'upload_params';
  }
}

module.exports = new ResponseEntityKeyConstants();
