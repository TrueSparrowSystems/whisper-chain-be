const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for s3 formatter.
 *
 * @class S3Formatter
 */
class S3Formatter extends BaseFormatter {
  /**
   * Constructor for s3 formatter.
   *
   * @param {object} params
   * @param {Array} params.s3_urls
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.s3Urls = params.s3_urls;
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
      s3_urls: oThis.s3Urls
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
   * @returns {{type: object, properties: {s3_urls: {type: array, example: string}}}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        s3_urls: {
          type: 'array',
          example: `[
            'https://stability/83cf4737-813e-4946-be36-812d853a9253.png',
            'https://stability/51be1bb3-0aea-4bbc-9399-dba1b801d036.png'
          ]`
        }
      },
      required: ['s3_urls']
    };
  }
}

module.exports = S3Formatter;
