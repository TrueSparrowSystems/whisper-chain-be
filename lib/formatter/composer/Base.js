const rootPrefix = '../../..',
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

class BaseComposer {
  /**
   * Constructor for Base Composer
   *
   * @param {object} params
   * @param {string} params.resultType
   * @param {string} params.resultTypeLookup
   * @param {object} params.entityKindToResponseKeyMap
   * @param {object} params.serviceData
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.resultType = params.resultType;
    oThis.resultTypeLookup = params.resultTypeLookup;
    oThis.entityKindToResponseKeyMap = JSON.parse(JSON.stringify(params.entityKindToResponseKeyMap));
    oThis.serviceData = params.serviceData;

    oThis.formattedData = {};
  }

  /**
   * Perform.
   *
   * @returns {{}}
   */
  async perform() {
    const oThis = this;

    await oThis.addCommonFormatterEntities();

    await oThis.formatEntities();

    if (oThis.resultType) {
      oThis.formattedData.result_type = oThis.resultType;

      if (!oThis.resultTypeLookup) {
        throw new Error('send result type lookup.'); // This error will help in development.
      }

      oThis.formattedData.result_type_lookup = oThis.resultTypeLookup;
    }

    return responseHelper.successWithData(oThis.formattedData);
  }

  /**
   * Add generic/common entities for formatting
   *
   * @returns {Promise<void>}
   */
  async addCommonFormatterEntities() {
    const oThis = this;
    // Add tracking details entity to entityKindToResponseKeyMap if
    // - it's not present already.
    // - currentTrackingDetails data is present in serviceData.
    if (
      !oThis.entityKindToResponseKeyMap[entityTypeConstants.currentTrackingDetails] &&
      oThis.serviceData[entityTypeConstants.currentTrackingDetails]
    ) {
      logger.log('currentTrackingDetails is not defined in entityKindToResponseKeyMap, adding it');
      oThis.entityKindToResponseKeyMap[entityTypeConstants.currentTrackingDetails] =
        responseEntityKey.currentTrackingDetails;
    }

    // Add invite program detail entity to entityKindToResponseKeyMap if
    // - it's not present already.
    // - inviteProgramDetail data is present in serviceData.
    if (
      !oThis.entityKindToResponseKeyMap[entityTypeConstants.inviteProgramDetail] &&
      oThis.serviceData[entityTypeConstants.inviteProgramDetail]
    ) {
      logger.log('inviteProgramDetail is not defined in entityKindToResponseKeyMap, adding it');
      oThis.entityKindToResponseKeyMap[entityTypeConstants.inviteProgramDetail] = responseEntityKey.inviteProgramDetail;
    }
  }

  /**
   * Format entities.
   *
   * @returns {Promise<void>}
   */
  async formatEntities() {
    const oThis = this;

    for (const internalEntityKey in oThis.entityKindToResponseKeyMap) {
      const EntityFormatter = oThis.constructor.entityClassMapping[internalEntityKey];
      const entityFormatterResp = await new EntityFormatter(oThis.serviceData, internalEntityKey).perform();

      if (entityFormatterResp.isFailure()) {
        await createErrorLogsEntry.perform(entityFormatterResp, errorLogsConstants.highSeverity);
        return Promise.reject(entityFormatterResp);
      }

      oThis.formattedData[oThis.entityKindToResponseKeyMap[internalEntityKey]] = entityFormatterResp.data;
    }
  }

  /**
   * entity class mapping
   *
   * @returns {{}}
   */
  static get entityClassMapping() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = BaseComposer;
