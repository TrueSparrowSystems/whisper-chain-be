const rootPrefix = '..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  ImageModel = require(rootPrefix + '/app/models/mysql/entity/Image'),
  s3Constants = require(rootPrefix + '/lib/globalConstant/s3'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  imageConstants = require(rootPrefix + '/lib/globalConstant/entity/image');

/**
 * Class to validate and shorten image urls.
 *
 * @class ImageLib
 */
class ImageLib {
  /**
   * Method to validate image object.
   *
   * @param {object} params
   * @param {string} params.imageUrl
   * @param {string} params.kind
   * @param {number} [params.size]
   * @param {number} [params.width]
   * @param {number} [params.height]
   *
   * @returns {result}
   */
  validateImageObj(params) {
    if (
      !CommonValidators.validateInteger(params.size || 0) ||
      !CommonValidators.validateInteger(params.width || 0) ||
      !CommonValidators.validateInteger(params.height || 0)
    ) {
      // Return error.
      return responseHelper.paramValidationError({
        internal_error_identifier: 'lib_il_1',
        api_error_identifier: 'invalid_api_params',
        params_error_identifiers: 'invalid_resolution',
        debug_options: { params: params }
      });
    }

    const response = {
      original: {
        size: params.size,
        height: params.height,
        width: params.width
      }
    };

    return responseHelper.successWithData({ image: response });
  }

  /**
   * Method to validate image and save it.
   *
   * @param {object} params
   * @param {string} params.imageUrl
   * @param {string} params.kind
   * @param {boolean} [params.isExternalUrl]
   * @param {number} [params.size]
   * @param {number} [params.width]
   * @param {number} [params.height]
   *
   * @param params
   * @returns {Promise<*>}
   */
  async validateAndSave(params) {
    const oThis = this;

    const resp = oThis.validateImageObj(params);
    if (resp.isFailure()) {
      return resp;
    }

    const imageObject = resp.data.image;

    logger.log('params.isExternalUrl ----------->', params.isExternalUrl);
    logger.log('params.imageUrl ----------->', params.imageUrl);
    logger.log('imageObject ----------->', imageObject);
    let urlTemplateUrl = s3Constants.convertToShortUrl(params.imageUrl);

    if (!params.isExternalUrl) {
      const splitUrlArray = urlTemplateUrl.split('.'),
        urlWithoutExtension = splitUrlArray[0],
        urlExtension = splitUrlArray[1];
      urlTemplateUrl = urlWithoutExtension + s3Constants.fileNameShortSizeSuffix + '.' + urlExtension;
    }

    logger.log('urlTemplateUrl Image ------------------>', urlTemplateUrl);

    const insertParams = {
      urlTemplate: urlTemplateUrl,
      resolutions: imageObject,
      kind: params.kind,
      resizeStatus: imageConstants.notResized
    };

    const imageRow = await new ImageModel().insertImage(insertParams);

    return responseHelper.successWithData({ image: imageObject, insertId: imageRow.insertId });
  }
}

module.exports = new ImageLib();
