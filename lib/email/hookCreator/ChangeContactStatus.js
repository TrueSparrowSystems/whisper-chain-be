const rootPrefix = '../../..',
  HookCreatorBase = require(rootPrefix + '/lib/email/hookCreator/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook'),
  pepoCampaignsConstants = require(rootPrefix + '/lib/globalConstant/pepoCampaigns');

/**
 * Class to change contact status in pepo campaigns.
 *
 * @class ChangeContactStatus
 */
class ChangeContactStatus extends HookCreatorBase {
  /**
   * Constructor to change contact status in pepo campaigns.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} params.status: Contact status to be updated
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   *
   * @augments HookCreatorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.status = params.status;
  }

  /**
   * Get an event type.
   *
   * @returns {string}
   * @private
   */
  get _eventType() {
    return emailServiceApiCallHookConstants.changeContactStatusEventType;
  }

  /**
   * Validate specific data.
   *
   * @private
   */
  _validate() {
    const oThis = this;

    super._validate();

    if (!pepoCampaignsConstants.supportedContactStatusKinds[oThis.status]) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hc_ccs_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { status: oThis.status }
        })
      );
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
      status: oThis.status
    });
  }
}

module.exports = ChangeContactStatus;
