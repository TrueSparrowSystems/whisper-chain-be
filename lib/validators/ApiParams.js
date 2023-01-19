const rootPrefix = '../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  webConfig = require(rootPrefix + '/config/apiParams/web/signature'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions');

/**
 * Class for API params validation.
 *
 * @class ApiParamsValidator
 */
class ApiParamsValidator {
  /**
   * Constructor for API params validation.
   *
   * @param {object} params
   * @param {string} params.apiName: human readable name of API Fired - used for finding the mandatory and optional params
   * @param {string} params.apiVersion: API Version
   * @param {object} params.externalParams: object containing params sent in request
   * @param {object} params.internalParams: object containing params set in request internally
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.apiName = params.apiName;
    oThis.apiVersion = params.apiVersion;
    oThis.externalParams = params.externalParams;
    oThis.internalParams = params.internalParams;

    oThis.paramsConfig = null;
    oThis.sanitisedApiParams = {};
    oThis.paramErrors = [];
    oThis.dynamicErrorConfig = {};
  }

  /**
   * Main performer for class.
   *
   * @return {promise<result>}
   */
  async perform() {
    const oThis = this;

    oThis._logInputParameters();

    await oThis._fetchParamsConfig();

    await oThis._validateMandatoryParams();

    await oThis._checkOptionalParams();

    return oThis._responseData();
  }

  /**
   * Print filtered input parameters to enable better debugging.
   *
   * @private
   */
  _logInputParameters() {
    const oThis = this;

    const filteredExternalParams = {},
      filteredInternalParams = {};

    if (CommonValidators.validateNonEmptyObject(oThis.externalParams)) {
      for (const externalParamKey in oThis.externalParams) {
        if (oThis.sensitiveParametersMap[externalParamKey]) {
          continue;
        }
        filteredExternalParams[externalParamKey] = oThis.externalParams[externalParamKey];
      }
    }
    if (CommonValidators.validateNonEmptyObject(oThis.internalParams)) {
      for (const internalParamKey in oThis.internalParams) {
        if (oThis.sensitiveParametersMap[internalParamKey]) {
          continue;
        }
        filteredInternalParams[internalParamKey] = oThis.internalParams[internalParamKey];
      }
    }

    logger.debug('ApiParamsValidator:: External input parameters -------->', JSON.stringify(filteredExternalParams));
    logger.debug('ApiParamsValidator:: Internal input parameters -------->', JSON.stringify(filteredInternalParams));
  }

  /**
   * Fetch params config for an API.
   *
   * @sets oThis.paramsConfig
   *
   * @private
   * @return {Promise<result>}
   */
  async _fetchParamsConfig() {
    const oThis = this;

    let versionConfig = {};

    if (oThis.apiVersion === apiVersions.web) {
      versionConfig = webConfig;
    } else {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_v_ap_2',
          api_error_identifier: 'invalid_api_version',
          debug_options: {}
        })
      );
    }
    oThis.paramsConfig = versionConfig[oThis.apiName];

    if (!oThis.paramsConfig) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_v_ap_3',
          api_error_identifier: 'invalid_api_name',
          debug_options: { apiName: oThis.apiName }
        })
      );
    }

    return responseHelper.successWithData({});
  }

  /**
   * Validate mandatory parameters.
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _validateMandatoryParams() {
    const oThis = this;

    const mandatoryKeys = oThis.paramsConfig.mandatory || [];

    for (let index = 0; index < mandatoryKeys.length; index++) {
      const whiteListedKeyConfig = mandatoryKeys[index],
        whiteListedKeyName = whiteListedKeyConfig.parameter;

      const sourceParams =
        whiteListedKeyConfig.kind && whiteListedKeyConfig.kind == 'internal'
          ? oThis.internalParams
          : oThis.externalParams;

      if (
        Object.prototype.hasOwnProperty.call(sourceParams, whiteListedKeyName) &&
        !CommonValidators.isVarNullOrUndefined(sourceParams[whiteListedKeyName])
      ) {
        // Validate value as per method name passed in config
        oThis._validateValue(whiteListedKeyName, whiteListedKeyConfig, sourceParams);
      } else {
        if (whiteListedKeyConfig.missingKeyError) {
          oThis.paramErrors.push(whiteListedKeyConfig.missingKeyError);
        } else {
          oThis.paramErrors.push(`missing_${whiteListedKeyName}`);
          oThis.dynamicErrorConfig[`missing_${whiteListedKeyName}`] = {
            parameter: whiteListedKeyName,
            code: 'missing',
            message:
              'Required parameter ' +
              whiteListedKeyName +
              ' is missing. Please inspect for what is being sent, rectify and re-submit.'
          };
        }
      }
    }

    return responseHelper.successWithData({});
  }

  /**
   * Check optional params
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _checkOptionalParams() {
    const oThis = this;

    const optionalKeysConfig = oThis.paramsConfig.optional || [];

    for (let index = 0; index < optionalKeysConfig.length; index++) {
      const optionalKeyConfig = optionalKeysConfig[index],
        optionalKeyName = optionalKeyConfig.parameter;

      const sourceParams =
        optionalKeyConfig.kind && optionalKeyConfig.kind === 'internal' ? oThis.internalParams : oThis.externalParams;

      if (
        Object.prototype.hasOwnProperty.call(sourceParams, optionalKeyName) &&
        !CommonValidators.isVarNullOrUndefined(sourceParams[optionalKeyName])
      ) {
        // Validate value as per method name passed in config
        oThis._validateValue(optionalKeyName, optionalKeyConfig, sourceParams);
      }
    }

    return responseHelper.successWithData({});
  }

  /**
   * Validate param value with the validator config.
   *
   * @param {string} keyName
   * @param {object} keyConfig
   * @param {object} sourceParams
   *
   * @returns {Promise<boolean>}
   * @private
   */
  async _validateValue(keyName, keyConfig, sourceParams) {
    const oThis = this;

    // Validate value as per method name passed in config.
    const valueToValidate = sourceParams[keyName],
      validatorMethods = keyConfig.validatorMethods;

    for (let index = 0; index < validatorMethods.length; index++) {
      const validatorMethod = validatorMethods[index],
        validatorMethodName = Object.keys(validatorMethod)[0],
        validatorMethodErrorkey = validatorMethod[validatorMethodName],
        validatorMethodInstance = CommonValidators[validatorMethodName];

      let isValueValid = null;

      if (validatorMethodInstance) {
        isValueValid = validatorMethodInstance.apply(CommonValidators, [valueToValidate]);
      } else {
        isValueValid = false;
        logger.error(`${validatorMethodName} does not exist.`);
      }

      if (!isValueValid) {
        if (validatorMethodErrorkey) {
          oThis.paramErrors.push(validatorMethodErrorkey);
        } else {
          oThis.paramErrors.push(`invalid_${keyName}`);
          oThis.dynamicErrorConfig[`invalid_${keyName}`] = {
            parameter: keyName,
            code: 'invalid',
            message: 'Invalid parameter ' + keyName + '.  Please ensure the input is well formed.'
          };
        }

        return false;
      }
    }

    oThis.sanitisedApiParams[keyName] = valueToValidate;

    return true;
  }

  /**
   * API params validation response.
   *
   * @private
   * @return {result}
   */
  async _responseData() {
    const oThis = this;

    if (oThis.paramErrors.length > 0) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'v_ap_rd_1',
          api_error_identifier: 'invalid_api_params',
          params_error_identifiers: oThis.paramErrors,
          error_config: basicHelper.fetchErrorConfig(oThis.apiVersion, oThis.dynamicErrorConfig),
          debug_options: {}
        })
      );
    }

    return responseHelper.successWithData({ sanitisedApiParams: oThis.sanitisedApiParams });
  }

  /**
   * Returns sensitive parameters map.
   *
   * @returns {{}}
   */
  get sensitiveParametersMap() {
    return {
      password: 1
    };
  }
}

module.exports = ApiParamsValidator;
