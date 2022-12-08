const rootPrefix = '../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs');

// Declare error config.
const errorConfig = basicHelper.fetchErrorConfig(apiVersions.web);

/**
 * Base class for all services.
 *
 * @class ServicesBase
 */
class ServicesBase {
  /**
   * Constructor for all services.
   *
   * @constructor
   */
  constructor() {
    const oThis = this;
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<void | never>}
   */
  perform() {
    const oThis = this;

    return oThis._asyncPerform().catch(async function(err) {
      let errorObject = err;

      if (!responseHelper.isCustomResult(err)) {
        errorObject = responseHelper.error({
          internal_error_identifier: 'a_s_b_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { error: err.toString(), stack: err.stack },
          error_config: errorConfig
        });

        await createErrorLogsEntry.perform(errorObject, errorLogsConstants.mediumSeverity);
        logger.error(' In catch block of services/Base.js Error is: ', err);
      }
      logger.error(' Stringified error:: ', JSON.stringify(errorObject.getDebugData(errorConfig)));

      return errorObject;
    });
  }

  /**
   * Async perform.
   *
   * @private
   * @returns {Promise<void>}
   */
  async _asyncPerform() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Parse pagination identifier.
   *
   * @param {string} paginationIdentifier
   *
   * @return {*}
   * @private
   */
  _parsePaginationParams(paginationIdentifier) {
    return basicHelper.decryptPageIdentifier(paginationIdentifier);
  }

  /**
   * Validate page size.
   *
   * @sets oThis.limit
   *
   * @return {Promise<never>}
   * @private
   */
  async _validatePageSize() {
    const oThis = this;

    const validationResponse = CommonValidators.validateAndSanitizeLimit(
      oThis._currentPageLimit(),
      oThis._defaultPageLimit(),
      oThis._minPageLimit(),
      oThis._maxPageLimit()
    );

    if (!validationResponse[0]) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'a_s_b_2',
          api_error_identifier: 'invalid_api_params',
          params_error_identifiers: ['invalid_limit'],
          debug_options: {}
        })
      );
    }

    oThis.limit = validationResponse[1];
  }

  /**
   * Get current page limit.
   *
   * @private
   */
  _currentPageLimit() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Get default page limit.
   *
   * @private
   */
  _defaultPageLimit() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Get minimum page limit.
   *
   * @private
   */
  _minPageLimit() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Get maximum page limit.
   *
   * @private
   */
  _maxPageLimit() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = ServicesBase;
