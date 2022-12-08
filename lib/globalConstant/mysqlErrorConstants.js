/**
 * Class for for Mysql Error Constants.
 *
 * @class MysqlErrors
 */
class MysqlErrors {
  /**
   * Get string for duplicate entry error.
   *
   * @returns {string}
   */
  get duplicateError() {
    return 'ER_DUP_ENTRY';
  }

  /**
   * Get string for dead lock error.
   *
   * @returns {string}
   */
  get lockDeadlockError() {
    return 'ER_LOCK_DEADLOCK';
  }
}

module.exports = new MysqlErrors();
