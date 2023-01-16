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
  // Db kind ends.
}

module.exports = new DbKind();
