const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  ChainSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/Chain/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for chains map formatter.
 *
 * @class ChainsMapFormatter
 */
class ChainsMapFormatter extends BaseFormatter {
  /**
   * Constructor for chains map formatter.
   *
   * @param {object} params
   * @param {object} params.chains
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.chainsByIdMap = params[entityTypeConstants.chains];
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

    for (const chain in oThis.chainsByIdMap) {
      const chainObj = oThis.chainsByIdMap[chain];

      const formattedChain = new ChainSingleFormatter({
        id: chainObj.id,
        uts: chainObj.uts,
        ipfsObjectId: chainObj.ipfsObjectId,
        recentWhisperIds: chainObj.recentWhisperIds,
        startTs: chainObj.startTs,
        imageId: chainObj.imageId,
        platform: chainObj.platform,
        platformChainId: chainObj.platformChainId,
        platformChainUrl: chainObj.platformChainUrl,
        status: chainObj.status,
        totalWhispers: chainObj.totalWhispers
      }).perform();

      if (formattedChain.isFailure()) {
        return formattedChain;
      }

      finalResponse[chainObj.id] = formattedChain.data;
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
        internal_error_identifier: 'l_f_s_c_m_v_1',
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
    const singleSchema = ChainSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: ChainSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = ChainsMapFormatter;
