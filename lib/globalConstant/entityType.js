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
   * Get internal entity type string for users map.
   *
   * @returns {string}
   */
  get usersMap() {
    return 'usersMap';
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
}

module.exports = new EntityType();
