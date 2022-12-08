const rootPrefix = '../../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  HookCreatorBase = require(rootPrefix + '/lib/email/hookCreator/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Class for removing contact from pepo campaigns.
 *
 * @class RemoveContact
 */
class RemoveContact extends HookCreatorBase {
  /**
   * Constructor to send transactional mail.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   * @param {hash} params.templateVars: Template vars
   *
   * @augments HookCreatorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.templateVars = params.templateVars || {};
  }

  /**
   * Validate specific data.
   *
   * @private
   */
  _validate() {
    const oThis = this;

    super._validate();

    if (CommonValidators.validateNonEmptyObject(oThis.templateVars) && !oThis.templateVars.receiverEmail) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hc_rc_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { templateVars: oThis.templateVars }
        })
      );
    }
  }

  /**
   * Get an event type.
   *
   * @returns {string}
   * @private
   */
  get _eventType() {
    return emailServiceApiCallHookConstants.removeContactEventType;
  }

  /**
   * Create hook.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _createHook() {
    const oThis = this;

    await super._createHook({ templateVars: oThis.templateVars });
  }
}

module.exports = RemoveContact;
