const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  SuggestionSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/Suggestion/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for suggestion map formatter.
 *
 * @class SuggestionMapFormatter
 */
class SuggestionMapFormatter extends BaseFormatter {
  /**
   * Constructor for suggestion map formatter.
   *
   * @param {object} params
   * @param {object} params.suggestions
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.suggestionByIdMap = params[entityTypeConstants.suggestions];
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

    for (const suggestion in oThis.suggestionByIdMap) {
      const suggestionObj = oThis.suggestionByIdMap[suggestion];

      const formattedSuggestion = new SuggestionSingleFormatter({
        id: suggestionObj.id,
        uts: suggestionObj.uts,
        imageUrl: suggestionObj.imageUrl
      }).perform();

      if (formattedSuggestion.isFailure()) {
        return formattedSuggestion;
      }

      finalResponse[suggestionObj.id] = formattedSuggestion.data;
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
        internal_error_identifier: 'l_f_s_s_m_v_1',
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
    const singleSchema = SuggestionSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: SuggestionSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = SuggestionMapFormatter;
