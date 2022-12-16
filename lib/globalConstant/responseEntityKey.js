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
   * Get response key for entity type s3.
   *
   * @returns {string}
   */
  get s3() {
    return 's3';
  }

  /**
   * Get response key for entity type ipfs metadata.
   *
   * @returns {string}
   */
  get ipfsObjectIds() {
    return 'ipfs_object_ids';
  }

  /**
   * Get response key for entity type ipfs metadata.
   *
   * @returns {string}
   */
  get ipfsObjects() {
    return 'ipfs_object';
  }

  /**
   * Get response key for entity type suggestions.
   *
   * @returns {string}
   */
  get suggestions() {
    return 'suggestions';
  }

  /**
   * Get internal entity type string for suggestionsIds.
   *
   * @returns {string}
   */
  get suggestionsIds() {
    return 'suggestions_ids';
  }
}

module.exports = new ResponseEntityKeyConstants();
