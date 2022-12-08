const rootPrefix = '../../..',
  HookCreatorBase = require(rootPrefix + '/lib/email/hookCreator/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook'),
  transactionalEmailVariablesConfig = require(rootPrefix + '/config/transactionalEmailVariables');

let supportedTemplatesMapping;

/**
 * Class to send transactional mail.
 *
 * @class SendTransactionalMail
 */
class SendTransactionalMail extends HookCreatorBase {
  /**
   * Constructor to send transactional mail.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   * @param {string} params.templateName: Template name
   * @param {hash} params.templateVars: Template vars
   *
   * @augments HookCreatorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.templateName = params.templateName;
    oThis.templateVars = params.templateVars;
  }

  /**
   * Validate specific data.
   *
   * @private
   */
  _validate() {
    const oThis = this;

    super._validate();

    if (!oThis.supportedTemplatesMap[oThis.templateName]) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hc_stm_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { templateName: oThis.templateName }
        })
      );
    }

    oThis._filterAndValidateTemplateVars();
  }

  /**
   * Validate specific templateVars based on trandsactional email templateName.
   *
   * @private
   */
  _filterAndValidateTemplateVars() {
    const oThis = this;

    const templateConfig = transactionalEmailVariablesConfig[oThis.templateName];

    // NOTE: Here add specific validations according to the template vars keys.
    if (!oThis.templateVars || !templateConfig) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hc_stm_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            templateVars: oThis.templateVars,
            templateConfig: templateConfig,
            templateName: oThis.templateName
          }
        })
      );
    }

    const filteredTemplateVars = {};

    for (const variableKey in templateConfig) {
      const response = oThis._filterRecursively(
        variableKey,
        templateConfig[variableKey],
        oThis.templateVars[variableKey]
      );
      filteredTemplateVars[variableKey] = response;
    }

    oThis.templateVars = filteredTemplateVars;
  }

  /**
   * Validate specific templateVars based on transactional email template name.
   *
   * @private
   */
  _filterRecursively(configKey, configVal, inputVal) {
    const oThis = this;

    if (!inputVal) {
      return inputVal;
    }

    if (configVal === 1) {
      return inputVal;
    } else if (configVal instanceof Object) {
      const newVal = {};

      Object.keys(configVal).forEach(function(key) {
        // eslint-disable-next-line no-prototype-builtins
        if (inputVal.hasOwnProperty(key)) {
          newVal[key] = oThis._filterRecursively(key, configVal[key], inputVal[key]);
        }
      });

      return newVal;
    } else {
      // eslint-disable-next-line no-console
      console.error('Invalid configVal type: ', typeof configVal, configKey, oThis.templateVars, oThis.templateName);
    }
  }

  // This function is used to validate template names.
  get supportedTemplatesMap() {
    if (supportedTemplatesMapping) {
      return supportedTemplatesMapping;
    }

    supportedTemplatesMapping = {};
    for (const templateName in transactionalEmailVariablesConfig) {
      supportedTemplatesMapping[templateName] = 1;
    }

    return supportedTemplatesMapping;
  }

  /**
   * Get an event type.
   *
   * @returns {string}
   * @private
   */
  get _eventType() {
    return emailServiceApiCallHookConstants.sendTransactionalEmailEventType;
  }

  /**
   * Create hook.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _createHook() {
    const oThis = this;

    await super._createHook({
      templateName: oThis.templateName,
      templateVars: oThis.templateVars
    });
  }
}

module.exports = SendTransactionalMail;
