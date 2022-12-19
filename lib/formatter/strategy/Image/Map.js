const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  ImageSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/Image/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for image map formatter.
 *
 * @class ImageMapFormatter
 */
class ImageMapFormatter extends BaseFormatter {
  /**
   * Constructor for image map formatter.
   *
   * @param {object} params
   * @param {object} params.images
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.ImageByIdMap = params[entityTypeConstants.images];
  }

  /**
   * Format the input object.
   *
   * @returns {result}
   * @private
   */
  _format() {
    const oThis = this;

    const finalResponse = {};

    for (const image in oThis.ImageByIdMap) {
      const imageObj = oThis.ImageByIdMap[image];

      const formattedImage = new ImageSingleFormatter({
        id: imageObj.id,
        uts: imageObj.uts,
        imageUrl: imageObj.imageUrl
      }).perform();

      if (formattedImage.isFailure()) {
        return formattedImage;
      }

      finalResponse[imageObj.id] = formattedImage.data;
    }

    return responseHelper.successWithData(finalResponse);
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    if (!CommonValidators.validateObject(formattedEntity)) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_i_m_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: {
          object: formattedEntity
        }
      });
    }

    return responseHelper.successWithData({});
  }

  static schema() {
    // We will need to construct an example for the map
    const singleSchema = ImageSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: ImageSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = ImageMapFormatter;
