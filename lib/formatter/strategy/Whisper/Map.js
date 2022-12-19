const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  WhisperSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/Whisper/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for whispers map formatter.
 *
 * @class WhispersMapFormatter
 */
class WhispersMapFormatter extends BaseFormatter {
  /**
   * Constructor for whispers map formatter.
   *
   * @param {object} params
   * @param {object} params.whispers
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.whispersByIdMap = params[entityTypeConstants.whispers];
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

    for (const whisper in oThis.whispersByIdMap) {
      const whisperObj = oThis.whispersByIdMap[whisper];

      const formattedWhisper = new WhisperSingleFormatter({
        id: whisperObj.id,
        imageId: whisperObj.imageId,
        userId: whisperObj.userId,
        ipfsObjectId: whisperObj.ipfsObjectId,
        uts: whisperObj.uts,
        platformChainId: whisperObj.platformChainId,
        platformChainUrl: whisperObj.platformChainUrl,
        chainId: whisperObj.chainId,
        platform: whisperObj.platform,
        status: whisperObj.status
      }).perform();

      if (formattedWhisper.isFailure()) {
        return formattedWhisper;
      }

      finalResponse[whisperObj.id] = formattedWhisper.data;
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
        internal_error_identifier: 'l_f_s_w_m_v_1',
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
    const singleSchema = WhisperSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: WhisperSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = WhispersMapFormatter;
