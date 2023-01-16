const rootPrefix = '../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for entity string
 *
 * @class EntityString
 */
class EntityString extends BaseFormatter {
  /**
   * Constructor for entity string formatter.
   *
   * @param {object} params
   * @param {string} internalEntityKey.
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params, internalEntityKey) {
    super();

    const oThis = this;

    oThis.internalEntityKey = internalEntityKey;
    oThis.str = params[internalEntityKey];
  }

  /**
   * Validate the input objects.
   *
   * @returns {result}
   * @private
   */
  _validate() {
    const oThis = this;

    if (!CommonValidators.validateNonEmptyString(oThis.str)) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_es_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: { str: oThis.str, internalEntityKey: oThis.internalEntityKey }
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

    return responseHelper.successWithData(oThis.str);
  }

  static schema() {
    return {
      type: 'string'
    };
  }
}

module.exports = EntityString;
