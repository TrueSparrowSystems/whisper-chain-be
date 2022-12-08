/**
 * Class for pagination related global constants.
 *
 * @class Pagination
 */
class Pagination {
  /**
   * Get key for pagination identifier.
   *
   * @returns {string}
   */
  get paginationIdentifierKey() {
    return 'pagination_identifier';
  }

  /**
   * Get key for next page payload.
   *
   * @returns {string}
   */
  get nextPagePayloadKey() {
    return 'next_page_payload';
  }

  /**
   * Get key for previous page payload.
   *
   * @returns {string}
   */
  get previousPagePayloadKey() {
    return 'previous_page_payload';
  }
}

module.exports = new Pagination();
