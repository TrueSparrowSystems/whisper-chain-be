/**
 * Class for db kind constants.
 *
 * @class DbKind
 */
class DbKind {
  // Db kinds start.
  /**
   * Get string for sql db kind.
   *
   * @returns {string}
   */
  get sqlDbKind() {
    return 'sql';
  }

  /**
   * Get string for cassandra db kind.
   *
   * @returns {string}
   */
  get cassandraDbKind() {
    return 'cassandra';
  }
  // Db kind ends.
}

module.exports = new DbKind();
