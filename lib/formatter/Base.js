const rootPrefix = '../..',
  CommonValidator = require(rootPrefix + '/lib/validators/Common'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

const has = Object.prototype.hasOwnProperty; // Cache the lookup once, in module scope.

/**
 * Base class for formatter.
 *
 * @class BaseFormatter
 */
class BaseFormatter {
  /**
   * Main performer for class.
   *
   * @returns {*|result}
   */
  perform() {
    const oThis = this;

    const formattedEntityResponse = oThis._format();

    const validationResponse = oThis._validate(formattedEntityResponse.data);

    if (validationResponse.isFailure()) {
      return validationResponse;
    }

    return formattedEntityResponse;
  }

  /**
   * Validate for single formatted entities. Not for Map and List entities.
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validateSingle(formattedEntity) {
    const oThis = this;

    const schema = oThis.constructor.schema();
    const requiredKeys = schema.required || [];
    const requiredKeyMap = {};
    for (const requiredKey of requiredKeys) {
      requiredKeyMap[requiredKey] = 1;
    }

    const invalidKeys = [],
      missingKeys = [];

    for (const key in schema.properties) {
      if (has.call(formattedEntity, key)) {
        if (
          CommonValidator.isVarUndefined(formattedEntity[key]) ||
          (requiredKeyMap[key] && CommonValidator.isVarNull(formattedEntity[key]))
        ) {
          invalidKeys.push(key);
        }
      } else {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0 || invalidKeys.length > 0) {
      console.trace(`FORMATTING_ERROR :: missingKeys: ${missingKeys}, invalidKeys: ${invalidKeys}`);

      return responseHelper.error({
        internal_error_identifier: 'l_f_b_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: {
          object: formattedEntity,
          requiredKeys: requiredKeys,
          missingKeys: missingKeys,
          invalidKeys: invalidKeys
        }
      });
    }

    return responseHelper.successWithData({});
  }

  /**
   * Format
   *
   * @returns {result}
   * @private
   */
  _format() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Validate formatted entity
   *
   * @param formattedEntity
   * @private
   */
  _validate(formattedEntity) {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Schema
   *
   * @returns object
   */
  static schema() {
    throw new Error('Sub-class to implement.');
  }
}

module.exports = BaseFormatter;
