const rootPrefix = '../../..',
  HookCreatorBase = require(rootPrefix + '/lib/email/hookCreator/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Class for adding contact in pepo campaigns.
 *
 * @class AddContact
 */
class AddContact extends HookCreatorBase {
  /**
   * Constructor for adding contact in pepo campaigns.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   * @param {object} [params.customAttributes]: Attribute which are to be set for this email
   *
   * @augments HookCreatorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.customAttributes = params.customAttributes || {};
  }

  /**
   * Get an event type.
   *
   * @returns {string}
   * @private
   */
  get _eventType() {
    return emailServiceApiCallHookConstants.addContactEventType;
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
            internal_error_identifier: 'l_e_hc_ac_v_1',
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
      custom_attributes: oThis.customAttributes
    });
  }
}

module.exports = AddContact;
