const rootPrefix = '../../..',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  paginationConstants = require(rootPrefix + '/lib/globalConstant/pagination');

/**
 * Class for Meta formatter.
 *
 * @class BaseMetaFormatter
 */
class BaseMetaFormatter {
  /**
   * Constructor for Meta
   *
   * @param {object} params
   * @param {object} params.meta
   * @param {object} [params.meta.next_page_payload]
   * @param {string} [params.meta.next_page_payload.pagination_identifier]
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.meta = params.meta;

    oThis.paginationIdentifierPresent = null; // To check if content inside meta is empty or not.
    oThis.payloadPageKeyType = null; // To check whether meta contains next_page_payload or previous_page_payload
  }

  /**
   * Perform.
   *
   * @return {{}}
   */
  perform() {
    const oThis = this;

    const meta = oThis._constructMeta();

    return responseHelper.successWithData(meta);
  }

  /**
   * Construct meta object
   *
   * @return {*}
   *
   * @private
   */
  _constructMeta() {
    const oThis = this;

    let meta = {};

    if (oThis._isPaginationIdentifierPresent()) {
      // Fetch everything present inside 'pagination_identifier' from meta payload key and encrypt that before sending outside..
      let paginationIdentifier = null;

      if (oThis.payloadPageKeyType === paginationConstants.nextPagePayloadKey) {
        meta[paginationConstants.nextPagePayloadKey] = {};
        paginationIdentifier =
          oThis.meta[paginationConstants.nextPagePayloadKey][paginationConstants.paginationIdentifierKey];
        meta[paginationConstants.nextPagePayloadKey][
          paginationConstants.paginationIdentifierKey
        ] = basicHelper.encryptPageIdentifier(paginationIdentifier);
      } else if (oThis.payloadPageKeyType === paginationConstants.previousPagePayloadKey) {
        meta[paginationConstants.previousPagePayloadKey] = {};
        paginationIdentifier =
          oThis.meta[paginationConstants.previousPagePayloadKey][paginationConstants.paginationIdentifierKey];
        meta[paginationConstants.previousPagePayloadKey][
          paginationConstants.paginationIdentifierKey
        ] = basicHelper.encryptPageIdentifier(paginationIdentifier);
      } else {
        throw new Error(`No suitable payload page key type found. payloadPageKeyType: ${oThis.payloadPageKeyType}`);
      }
    } else {
      if (oThis.payloadPageKeyType === paginationConstants.nextPagePayloadKey) {
        meta[paginationConstants.nextPagePayloadKey] = null;
      } else if (oThis.payloadPageKeyType === paginationConstants.previousPagePayloadKey) {
        meta[paginationConstants.previousPagePayloadKey] = null;
      } else {
        //Note: this is a valid case. if only meta is required and there is no pagination support.
        // throw new Error(`No suitable payload page key type found. payloadPageKeyType: ${oThis.payloadPageKeyType}`);
      }
    }

    // If meta contains additional supporting keys, add those keys here.
    meta = oThis._appendSpecificMetaData(meta);

    return meta;
  }

  /**
   * Check if pagination identifier present or not.
   *
   * @returns {boolean}
   * @private
   */
  _isPaginationIdentifierPresent() {
    const oThis = this;

    if (oThis.paginationIdentifierPresent == null) {
      let metaContent = null;

      if (oThis.meta[paginationConstants.nextPagePayloadKey]) {
        oThis.payloadPageKeyType = paginationConstants.nextPagePayloadKey;
        metaContent = oThis.meta[paginationConstants.nextPagePayloadKey];
      }

      if (oThis.meta[paginationConstants.previousPagePayloadKey]) {
        oThis.payloadPageKeyType = paginationConstants.previousPagePayloadKey;
        metaContent = oThis.meta[paginationConstants.previousPagePayloadKey];
      }

      oThis.paginationIdentifierPresent = !!(metaContent && metaContent[paginationConstants.paginationIdentifierKey]);
    }

    return oThis.paginationIdentifierPresent;
  }

  /**
   * Append service specific keys in meta.
   *
   * @private
   */
  _appendSpecificMetaData() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = BaseMetaFormatter;
