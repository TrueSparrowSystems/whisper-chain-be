const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util');

let invertedPublicationStatus;

/**
 * Class for user eth addresses constants.
 *
 * @class PlatformChainSeedsConstants
 */
class PlatformChainSeedsConstants {
  // publication status enum starts
  /**
   * Get string value for published status.
   *
   * @returns {string}
   */
  get publishedStatus() {
    return 'PUBLISHED';
  }

  /**
   * Get string value for not published status.
   *
   * @returns {string}
   */
  get notPublishedStatus() {
    return 'NOT_PUBLISHED';
  }
  // publication status enum ends

  /**
   * Get enum for publication status.
   *
   * @returns {object}
   */
  get publicationStatus() {
    const oThis = this;

    return {
      '1': oThis.publishedStatus,
      '2': oThis.notPublishedStatus
    };
  }

  /**
   * Get enum value from publication status
   *
   * @returns {object}
   */
  get invertedPublicationStatus() {
    const oThis = this;

    invertedPublicationStatus = invertedPublicationStatus || util.invert(oThis.publicationStatus);

    return invertedPublicationStatus;
  }
}

module.exports = new PlatformChainSeedsConstants();
