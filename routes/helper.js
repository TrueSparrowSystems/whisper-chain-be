/* eslint-disable require-atomic-updates */
const rootPrefix = '..',
  ApiParamsValidator = require(rootPrefix + '/lib/validators/ApiParams'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for routes helper.
 *
 * @class RoutesHelper
 */
class RoutesHelper {
  /**
   * Perform.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @param {string} serviceGetter
   * @param {string} errorCode
   * @param {function} afterValidationCallback
   * @param {function} onServiceSuccess
   * @param {function} onServiceFailure
   *
   * @return {Promise<*>}
   */
  static perform(
    req,
    res,
    next,
    serviceGetter,
    errorCode,
    afterValidationCallback,
    onServiceSuccess,
    onServiceFailure
  ) {
    const oThis = this,
      errorConfig = basicHelper.fetchErrorConfig(req.internalDecodedParams.apiVersion);

    return oThis
      .asyncPerform(req, res, next, serviceGetter, afterValidationCallback, onServiceSuccess, onServiceFailure)
      .catch(async function(error) {
        let errorObject = error;

        if (responseHelper.isCustomResult(error)) {
          oThis._renderResponse(error, res, errorConfig);
        } else {
          errorObject = responseHelper.error({
            internal_error_identifier: `unhandled_catch_response:r_h:${errorCode}`,
            api_error_identifier: 'unhandled_catch_response',
            debug_options: { error: error.toString(), stack: error.stack }
          });
          logger.error(errorCode, 'Something went wrong', error);

          oThis._renderResponse(errorObject, res, errorConfig);
        }
      });
  }

  /**
   * Async perform.
   *
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @param {string} serviceGetter
   * @param {function} afterValidationCallback
   * @param {function} onServiceSuccess
   * @param {function} onServiceFailure
   *
   * @return {Promise<*>}
   */
  static async asyncPerform(
    req,
    res,
    next,
    serviceGetter,
    afterValidationCallback,
    onServiceSuccess,
    onServiceFailure
  ) {
    const oThis = this;
    req.decodedParams = req.decodedParams || {};
    req.internalDecodedParams = req.internalDecodedParams || {};

    const errorConfig = basicHelper.fetchErrorConfig(req.internalDecodedParams.apiVersion);

    const apiParamsValidatorRsp = await new ApiParamsValidator({
      apiName: req.internalDecodedParams.apiName,
      apiVersion: req.internalDecodedParams.apiVersion,
      externalParams: req.decodedParams,
      internalParams: req.internalDecodedParams
    }).perform();

    // If param is internal or external, the sanitized params have union of them.
    req.serviceParams = apiParamsValidatorRsp.data.sanitisedApiParams;

    if (afterValidationCallback) {
      req.serviceParams = await afterValidationCallback(req.serviceParams);
    }

    Object.assign(req.serviceParams);

    const handleResponse = async function(response) {
      if (response.isSuccess()) {
        if (onServiceSuccess) {
          // If required, this function could reformat data as per API version requirements.
          // NOTE: This method should modify response.data

          await onServiceSuccess(response);
        } else {
          response = responseHelper.successWithData({}, response.goTo || {});
        }
      }

      if (response.isFailure() && onServiceFailure) {
        await onServiceFailure(response);
      }

      return oThis._renderResponse(response, res, errorConfig);
    };

    const Service = require(rootPrefix + serviceGetter);

    return new Service(req.serviceParams).perform().then(handleResponse);
  }

  /**
   * Render response
   *
   * @param {object} result
   * @param {object} res
   * @param {object} errorConfig
   *
   * @returns {object}
   * @private
   */
  static _renderResponse(result, res, errorConfig) {
    return responseHelper.renderApiResponse(result, res, errorConfig);
  }
}

module.exports = RoutesHelper;
