const rootPrefix = '../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  CronProcessModel = require(rootPrefix + '/app/models/mysql/big/CronProcess'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  cronSignatureConfig = require(rootPrefix + '/lib/cronProcess/cronSignature'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses');

/**
 * Class for cron processes param validator.
 *
 * @class CronProcessParamValidator
 */
class CronProcessParamValidator {
  /**
   * Constructor for cron processes base.
   *
   * @param {object} params
   * @param {number/string} [params.cronKind]
   * @param {number/string} [params.cronParams]
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.cronKind = params.cronKind;
    oThis.cronParams = params.cronParams;

    oThis.cronKindInt = null;
    oThis.sanitisedCronParams = {};
    oThis.cronParamsConfig = {};
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<*|result>}
   */
  async perform() {
    const oThis = this;

    await oThis._fetchAndValidateCronKind();

    await oThis._fetchParamsConfig();

    await oThis._validateMandatoryParams();

    await oThis._validateOptionalParams();

    // If sequenceNumber is present, validate sequenceNumber.
    if (CommonValidators.isVarNullOrUndefined(oThis.cronParams.sequenceNumber)) {
      // Cron is unique per env.
      await oThis._validateCronForUniquenessPerEnv();
    } else {
      await oThis._validateSequenceNumber(oThis.cronParams.sequenceNumber);
    }

    return responseHelper.successWithData({ sanitisedCronParams: oThis.sanitisedCronParams });
  }

  /**
   * Validate if cron kind is valid or not.
   *
   * @sets oThis.cronKindInt
   *
   * @returns {Promise<never>}
   * @private
   */
  async _fetchAndValidateCronKind() {
    const oThis = this;

    oThis.cronKindInt = cronProcessesConstants.invertedKinds[oThis.cronKind];

    if (!oThis.cronKindInt) {
      return oThis._customError('l_cp_cppv_1', 'Invalid cron kind: ' + oThis.cronKind);
    }
  }

  /**
   * Fetch params config for cron params.
   *
   * @sets oThis.cronParamsConfig
   *
   * @returns {*}
   * @private
   */
  async _fetchParamsConfig() {
    const oThis = this;

    oThis.cronParamsConfig = cronSignatureConfig[oThis.cronKind];

    if (!oThis.cronParamsConfig) {
      return oThis._customError('l_cp_cppv_2', 'Could not fetch cron params config for cron kind: ' + oThis.cronKind);
    }

    return responseHelper.successWithData({});
  }

  /**
   * Validate mandatory cron params.
   *
   * @sets oThis.sanitisedCronParams
   *
   * @returns {result}
   * @private
   */
  async _validateMandatoryParams() {
    const oThis = this,
      mandatoryKeys = oThis.cronParamsConfig.mandatory || [],
      paramErrors = [];

    let hasError = false;

    for (let index = 0; index < mandatoryKeys.length; index++) {
      const whiteListedKeyConfig = mandatoryKeys[index],
        whiteListedKeyName = whiteListedKeyConfig.parameter;

      if (
        Object.prototype.hasOwnProperty.call(oThis.cronParams, whiteListedKeyName) &&
        !CommonValidators.isVarNull(oThis.cronParams[whiteListedKeyName])
      ) {
        // Validate value as per method name passed in config.
        const valueToValidate = oThis.cronParams[whiteListedKeyName],
          validatorMethodName = whiteListedKeyConfig.validatorMethods,
          validatorMethodInstance = CommonValidators[validatorMethodName];

        let isValueValid = null;
        if (validatorMethodInstance) {
          isValueValid = validatorMethodInstance.apply(CommonValidators, [valueToValidate]);
        } else {
          isValueValid = false;
          logger.error(`${validatorMethodName} does not exist.`);
        }

        if (isValueValid) {
          oThis.sanitisedCronParams[whiteListedKeyName] = valueToValidate;
        } else {
          paramErrors.push(`invalid_${whiteListedKeyName}`);
          hasError = true;
        }
      } else {
        paramErrors.push(`missing_${whiteListedKeyName}`);
        hasError = true;
      }
    }

    if (hasError) {
      return oThis._customError('l_cp_cppv_3', 'Mandatory parameter validation failed. Given params: ' + paramErrors);
    }

    return responseHelper.successWithData({});
  }

  /**
   * Validate optional params.
   *
   * @sets oThis.sanitisedCronParams
   *
   * @returns {result}
   * @private
   */
  async _validateOptionalParams() {
    const oThis = this,
      optionalKeysConfig = oThis.cronParamsConfig.optional || [],
      paramErrors = [];

    let hasError = false;

    for (let index = 0; index < optionalKeysConfig.length; index++) {
      const optionalKeyConfig = optionalKeysConfig[index],
        optionalKeyName = optionalKeyConfig.parameter;

      if (
        Object.prototype.hasOwnProperty.call(oThis.cronParams, optionalKeyName) &&
        !CommonValidators.isVarNull(oThis.cronParams[optionalKeyName])
      ) {
        // Validate value as per method name passed in config.
        const valueToValidate = oThis.cronParams[optionalKeyName],
          validatorMethodName = optionalKeyConfig.validatorMethods,
          validatorMethodInstance = CommonValidators[validatorMethodName];

        let isValueValid = null;
        if (validatorMethodInstance) {
          isValueValid = validatorMethodInstance.apply(CommonValidators, [valueToValidate]);
        } else {
          isValueValid = false;
          logger.error(`${validatorMethodName} does not exist.`);
        }
        if (isValueValid) {
          oThis.sanitisedCronParams[optionalKeyName] = valueToValidate;
        } else {
          paramErrors.push(`invalid_${optionalKeyName}`);
          hasError = true;
        }
      }
    }

    if (hasError) {
      return oThis._customError('l_cp_cppv_4', 'Optional parameter validation failed. Given params: ' + paramErrors);
    }

    return Promise.resolve(responseHelper.successWithData({}));
  }

  /**
   * Validate if sequence number for cron already exists.
   *
   * @param {number} sequenceNumber
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validateSequenceNumber(sequenceNumber) {
    const oThis = this;

    const existingCrons = await new CronProcessModel()
        .select('*')
        .where({
          kind: oThis.cronKindInt
        })
        .fire(),
      existingCronsLength = existingCrons.length;

    for (let index = 0; index < existingCronsLength; index += 1) {
      const cronEntity = existingCrons[index],
        cronParams = JSON.parse(cronEntity.params);

      if (cronParams.sequenceNumber == sequenceNumber) {
        return oThis._customError('l_cp_cppv_6', 'Entry with same sequence number already exists in the table.');
      }
    }
  }

  /**
   * Validate if cron kind exists in the same environment again.
   *
   * @return {Promise<never>}
   * @private
   */
  async _validateCronForUniquenessPerEnv() {
    const oThis = this;

    const existingCrons = await new CronProcessModel()
      .select('*')
      .where({
        kind: oThis.cronKindInt
      })
      .fire();

    if (existingCrons.length !== 0) {
      return oThis._customError('l_cp_cppv_7', 'Cron already exists for current environment.');
    }
  }

  /**
   * Custom error.
   *
   * @param {string} errCode
   * @param {string} errMsg
   *
   * @returns {Promise<never>}
   * @private
   */
  _customError(errCode, errMsg) {
    logger.error(errMsg);

    return Promise.reject(
      responseHelper.error({
        internal_error_identifier: errCode,
        api_error_identifier: 'something_went_wrong',
        debug_options: { errMsg: errMsg }
      })
    );
  }
}

module.exports = CronProcessParamValidator;
