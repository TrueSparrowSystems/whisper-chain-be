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
}

module.exports = new EntityType();
