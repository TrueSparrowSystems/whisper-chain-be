const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for image formatter.
 *
 * @class ImageFormatter
 */
class ImageFormatter extends BaseFormatter {
  /**
   * Constructor for image formatter.
   *
   * @param {object} params
   * @param {integer} params.id
   * @param {integer} params.uts
   * @param {string} params.url
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.id = params.id;
    oThis.uts = params.uts;
    oThis.url = params.url;
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
      id: oThis.id,
      uts: oThis.uts,
      url: oThis.url
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
   * @returns {{type: object, properties: {uts: {type: string, example: number}, id: {description: string, type: string, example: number}, url: {type: string, example: string}}, required: [integer, string, integer]}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 123,
          description: 'BE notes: this is the id of images table'
        },
        url: {
          type: 'string',
          example: 'https://stability/83cf4737-813e-4946-be36-812d853a9253.png'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        }
      },
      required: ['id', 'url', 'uts']
    };
  }
}

module.exports = ImageFormatter;
