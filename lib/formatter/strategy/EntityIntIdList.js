const rootPrefix = '../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for entity integer id array
 *
 * @class EntityIntIdList
 */
class EntityIntIdList extends BaseFormatter {
  /**
   * Constructor for device formatter.
   *
   * @param {object} params
   * @param {object} internalEntityKey.
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params, internalEntityKey) {
    super();

    const oThis = this;

    oThis.idArray = params[internalEntityKey];
  }

  /**
   * Validate the input objects.
   *
   * @returns {result}
   * @private
   */
  _validate() {
    const oThis = this;

    if (
      !CommonValidators.validateAndSanitizeNonZeroIntegerArray(oThis.idArray) &&
      !CommonValidators.validateNonEmptyStringArray(oThis.idArray)
    ) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_eiil_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: { array: oThis.idArray }
      });
    }

    return responseHelper.successWithData({});
  }

  /**
   * Format the input object.
   *
   * @returns {object}
   * @private
   */
  _format() {
    const oThis = this;

    return responseHelper.successWithData(oThis.idArray);
  }

  static schema() {
    return {
      type: 'array',
      items: {
        type: 'integer',
        example: 123
      }
    };
  }
}

module.exports = EntityIntIdList;
