const rootPrefix = '../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  s3Wrapper = require(rootPrefix + '/lib/aws/S3Wrapper'),
  util = require(rootPrefix + '/lib/util'),
  shortToLongUrl = require(rootPrefix + '/lib/shortToLongUrl'),
  s3Constants = require(rootPrefix + '/lib/globalConstant/s3'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  imageConstants = require(rootPrefix + '/lib/globalConstant/'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class to upload current user params.
 *
 * @class UploadParams
 */
class UploadParams extends ServiceBase {
  /**
   * Constructor to upload current user params.
   *
   * @param {object} params
   * @param {Array<string>} [params.user_images]
   *
   * @augments ServiceBase
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.userImages = params.user_images || [];

    oThis.workingMap = {};
    oThis.apiResponse = {};
  }

  /**
   * Async perform.
   *
   * @return {Promise<void>}
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis._validateAndSanitizeParams();

    await oThis._setWorkingVars();

    await oThis._processWorkingMap();

    return responseHelper.successWithData({ uploadParamsMap: oThis.apiResponse });
  }

  /**
   * Validate and sanitize params.
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validateAndSanitizeParams() {
    const oThis = this;

    const paramErrors = [];

    if (oThis.userImages.length === 0) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'a_s_up_1',
          api_error_identifier: 'invalid_api_params',
          params_error_identifiers: paramErrors,
          debug_options: {}
        })
      );
    }

    if (paramErrors.length > 0) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'a_s_up_2',
          api_error_identifier: 'invalid_api_params',
          params_error_identifiers: paramErrors,
          debug_options: {}
        })
      );
    }
  }

  /**
   * Sets working map.
   *
   * @sets oThis.workingMap
   *
   * @returns {Promise<void>}
   * @private
   */
  async _setWorkingVars() {
    const oThis = this;

    // Add images, if present (according to image kinds).
    if (oThis.userImages.length > 0) {
      oThis.workingMap[s3Constants.imageFileType] = {
        [s3Constants.files]: oThis.userImages,
        [s3Constants.fileType]: imageConstants.profileImageKind,
        [s3Constants.resultKey]: s3Constants.userImagesResultKey
      };
    }
  }

  /**
   * Process map.
   *
   * @sets oThis.apiResponse
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processWorkingMap() {
    const oThis = this;

    // Here, file type Intent means image/video file.
    for (const fileTypeIntent in oThis.workingMap) {
      const resultHash = {},
        intentHash = oThis.workingMap[fileTypeIntent],
        fileArray = intentHash[s3Constants.files],
        resultKey = intentHash[s3Constants.resultKey],
        fileType = intentHash[s3Constants.fileType];

      for (let index = 0; index < fileArray.length; index++) {
        const feFileName = fileArray[index],
          fileExtension = util.getFileExtension(feFileName);

        if (!fileExtension) {
          return Promise.reject(
            responseHelper.paramValidationError({
              internal_error_identifier: 'a_s_up_3',
              api_error_identifier: 'invalid_api_params',
              params_error_identifiers: ['invalid_images'],
              debug_options: {
                feFileName: feFileName,
                fileExtension: fileExtension
              }
            })
          );
        }

        const contentType = oThis._getContent(fileTypeIntent, fileExtension);

        if (!contentType) {
          return Promise.reject(
            responseHelper.paramValidationError({
              internal_error_identifier: 'a_s_up_4',
              api_error_identifier: 'invalid_api_params',
              params_error_identifiers: ['invalid_images'],
              debug_options: {
                feFileName: feFileName,
                fileTypeIntent: fileTypeIntent,
                fileExtension: fileExtension,
                contentType: contentType
              }
            })
          );
        }

        const fileName = oThis._getRandomEncodedFileNames(fileExtension);

        const preSignedPostParams = await s3Wrapper.createPresignedPostFor(
          fileTypeIntent,
          fileName,
          contentType,
          { fileType: fileType } // Optional parameter.
        );

        logger.log('==== preSignedPostParams', preSignedPostParams);

        const s3Url = s3Constants.getS3Url(fileTypeIntent, fileName, { fileType: fileType }),
          cdnUrl = oThis._getCdnUrl(s3Url);

        logger.log('==== s3Url', s3Url);
        logger.log('==== cdnUrl', cdnUrl);

        resultHash[feFileName] = {
          postUrl: preSignedPostParams.url,
          postFields: preSignedPostParams.fields,
          s3Url: s3Url,
          cdnUrl: cdnUrl
        };
      }

      oThis.apiResponse[resultKey] = resultHash;
    }
  }

  /**
   * Get content type.
   *
   * @param {string} intent
   * @param {string} fileExtension
   *
   * @returns {string/null}
   * @private
   */
  _getContent(intent, fileExtension) {
    switch (intent) {
      case s3Constants.imageFileType:
        return util.getImageContentTypeForExtension(fileExtension);
      default:
        console.log('Unsupported file type.');

        return null;
    }
  }

  /**
   * Get random encoded file names.
   *
   * @param {string} extension
   *
   * @returns {string}
   * @private
   */
  _getRandomEncodedFileNames(extension) {
    const fileName = util.getS3FileName('');

    return fileName + extension;
  }

  /**
   * Get cdn url.
   *
   * @param {string} s3Url
   * @private
   */
  _getCdnUrl(s3Url) {
    const splittedUrlArray = s3Url.split('/'),
      fileName = splittedUrlArray.pop(),
      baseUrl = splittedUrlArray.join('/'),
      shortEntity = s3Constants.longUrlToShortUrlMap[baseUrl];

    const shortUrl = shortEntity + '/' + fileName;

    logger.log('==== shortUrl', shortUrl);

    return shortToLongUrl.getFullUrl(shortUrl);
  }
}

module.exports = UploadParams;
