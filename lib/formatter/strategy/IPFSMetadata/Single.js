const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for IPFS Metadata formatter.
 *
 * @class IPFSMetadataFormatter
 */
class IPFSMetadataFormatter extends BaseFormatter {
  /**
   * Constructor for s3 formatter.
   *
   * @param {object} params
   * @param {string} params.image
   * @param {string} params.metadata
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.image = params.image;
    oThis.metadata = params.metadata;
  }

  /**
   * Format the input object.
   *
   * @returns {*|result}
   * @private
   */
  _format() {
    const oThis = this;

    return responseHelper.successWithData({
      image: oThis.image,
      metadata: oThis.metadata
    });
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    const oThis = this;

    return oThis._validateSingle(formattedEntity);
  }

  /**
   * Schema
   *
   * @returns {{type: object, properties: {image: {type: string, example: string}, metadata: {type: string, example: string}}}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          example: 'ipfs://stability/jcdnjcjsdkjsdknvnjn'
        },
        metadata: {
          type: 'string',
          example: 'ipfs://stabilitjdnsjncjnjcnknckvn'
        }
      },
      required: ['image', 'metadata']
    };
  }
}

module.exports = IPFSMetadataFormatter;
