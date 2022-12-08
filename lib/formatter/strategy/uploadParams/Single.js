const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for Upload Params Single formatter.
 *
 * @class UploadParamsSingleFormatter
 */
class UploadParamsSingleFormatter extends BaseFormatter {
  /**
   * Constructor for get Upload Params formatter.
   *
   * @param {object} params.uploadParams
   * @param {string} params.uploadParams.postUrl
   * @param {object} params.uploadParams.postFields
   * @param {string} params.uploadParams.s3Url
   * @param {string} params.uploadParams.cdnUrl
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.uploadParams = params.uploadParams;

    oThis.postFields = oThis.uploadParams.postFields;
    oThis.postUrl = oThis.uploadParams.postUrl;
    oThis.s3Url = oThis.uploadParams.s3Url;
    oThis.cdnUrl = oThis.uploadParams.cdnUrl;
  }

  /**
   * Validate the input objects.
   *
   * @returns {result}
   * @private
   */
  _validate() {
    const oThis = this;

    const paramsKeyConfig = {
      postUrl: { isNullAllowed: false },
      postFields: { isNullAllowed: false },
      s3Url: { isNullAllowed: false },
      cdnUrl: { isNullAllowed: false }
    };

    return oThis.validateParameters(oThis.uploadParams, paramsKeyConfig);
  }

  /**
   * Format the input object.
   *
   * @returns {*|result|*}
   * @private
   */
  _format() {
    const oThis = this,
      postFieldsArray = [];

    for (const field in oThis.postFields) {
      postFieldsArray.push({
        ['key']: field,
        ['value']: oThis.postFields[field]
      });
    }

    return responseHelper.successWithData({
      id: Math.round(new Date() / 1000),
      uts: Math.round(new Date() / 1000),
      post_url: oThis.postUrl,
      post_fields: postFieldsArray,
      s3_url: oThis.s3Url,
      cdn_url: oThis.cdnUrl
    });
  }

  /**
   * Schema
   *
   * @returns {{type: string, properties: {post_url: {type: string, example: string}, uts: {type: string, example: number}, cdn_url: {type: string, example: string}, s3_url: {type: string, example: string}, post_fields: {type: string, example: string}, id: {type: string, example: number}}, required: [string, string, string, string]}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1651666861
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        post_url: {
          type: 'string',
          example: 'https://s3.amazonaws.com/userassets-example-com'
        },
        post_fields: {
          type: 'array',
          example: '[ { key: "key", "value": "d/ua/images/9d1b165f76134ef14dbe1d67fdfb4b25.jpeg" } ]'
        },
        s3_url: {
          type: 'string',
          example: 'https://userassets-example-com.s3.amazonaws.com/d/ua/images/9d1b165f76134ef14dbe1d67fdfb4b25.jpeg'
        },
        cdn_url: {
          type: 'string',
          example: 'https://example.cloudfront.net/d/ua/images/9d1b165f76134ef14dbe1d67fdfb4b25.jpeg'
        }
      },
      required: ['post_url', 'post_fields', 's3_url', 'cdn_url']
    };
  }
}

module.exports = UploadParamsSingleFormatter;
