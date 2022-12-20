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
    return 'ipfs_objects';
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
   * Get response key  type string for suggestionsIds.
   *
   * @returns {string}
   */
  get suggestionsIds() {
    return 'suggestions_ids';
  }

  /**
   * Get response key type string for whispers.
   *
   * @returns {string}
   */
  get whipsers() {
    return 'whispers';
  }

  /**
   * Get response key type string for chains.
   *
   * @returns {string}
   */
  get chains() {
    return 'chains';
  }

  /**
   * Get response key type string for images.
   *
   * @returns {string}
   */
  get images() {
    return 'images';
  }

  /**
   * Get response key type string for whisper Ids.
   *
   * @returns {string}
   */
  get whisperIds() {
    return 'whisper_ids';
  }

  /**
   * Get response key type string for chain Ids.
   *
   * @returns {string}
   */
  get chainIds() {
    return 'chain_ids';
  }
}

module.exports = new ResponseEntityKeyConstants();
