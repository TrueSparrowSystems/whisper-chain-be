const rootPrefix = '../../..',
  HookCreatorBase = require(rootPrefix + '/lib/email/hookCreator/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Class to update contact in pepo campaigns.
 *
 * @class UpdateContactAttributes
 */
class UpdateContactAttributes extends HookCreatorBase {
  /**
   * Constructor to update contact in pepo campaigns.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   * @param {object} [params.customAttributes]: Attribute which are to be set for this email
   * @param {object} [params.userSettings]: User settings which has to be updated for this email
   *
   * @augments HookCreatorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.customAttributes = params.customAttributes || {};
    oThis.userSettings = params.userSettings || {};
  }

  /**
   * Get an event type.
   *
   * @returns {string}
   * @private
   */
  get _eventType() {
    return emailServiceApiCallHookConstants.updateContactAttributeEventType;
  }

  /**
   * Validate specific data.
   *
   * @private
   */
  _validate() {
    const oThis = this;

    super._validate();

    // Add custom attributes related validation here.
    for (const customAttribute in oThis.customAttributes) {
      if (!emailServiceApiCallHookConstants.supportedCustomAttributesMap[customAttribute]) {
        return Promise.reject(
          responseHelper.error({
            internal_error_identifier: 'l_e_hc_uc_1',
            api_error_identifier: 'something_went_wrong',
            debug_options: { customAttributes: oThis.customAttributes }
          })
        );
      }
    }
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
      custom_attributes: oThis.customAttributes,
      user_settings: oThis.userSettings
    });
  }
}

module.exports = UpdateContactAttributes;
