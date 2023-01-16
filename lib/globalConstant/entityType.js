/**
 * Class for entity types.
 *
 * @class EntityType
 */
class EntityType {
  /**
   * Get internal entity type string for user ids.
   *
   * @returns {string}
   */
  get userIds() {
    return 'userIds';
  }

  /**
   * Get internal entity type string for s3 urls.
   *
   * @returns {string}
   */
  get s3() {
    return 's3';
  }

  /**
   * Get internal entity type string for IPFS Metadata.
   *
   * @returns {string}
   */
  get ipfsMetadata() {
    return 'ipfsMetadata';
  }

  /**
   * Get internal entity type string for users map.
   *
   * @returns {string}
   */
  get users() {
    return 'users';
  }

  /**
   * Get internal entity type string for current user.
   *
   * @returns {string}
   */
  get currentUser() {
    return 'currentUser';
  }

  /**
   * Get internal entity type string for Suggestions.
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
    return 'suggestionsIds';
  }

  /**
   * Get internal entity type string for ipfsObjects.
   *
   * @returns {string}
   */
  get ipfsObjects() {
    return 'ipfsObjects';
  }

  /**
   * Get internal entity type string for ipfsObjectIds.
   *
   * @returns {string}
   */
  get ipfsObjectIds() {
    return 'ipfsObjectIds';
  }

  /**
   * Get internal entity type string for whispers.
   *
   * @returns {string}
   */
  get whispers() {
    return 'whispers';
  }

  /**
   * Get internal entity type string for chains.
   *
   * @returns {string}
   */
  get chains() {
    return 'chains';
  }

  /**
   * Get internal entity type string for whispers.
   *
   * @returns {string}
   */
  get whisperIds() {
    return 'whisperIds';
  }

  /**
   * Get internal entity type string for chains.
   *
   * @returns {string}
   */
  get chainIds() {
    return 'chainIds';
  }

  /**
   * Get internal entity type string for images map.
   *
   * @returns {string}
   */
  get images() {
    return 'images';
  }
}

module.exports = new EntityType();
