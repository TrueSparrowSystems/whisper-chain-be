const rootPrefix = '../../..',
  HookProcessorBase = require(rootPrefix + '/lib/email/hookProcessor/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  pepoCampaignsWrapper = require(rootPrefix + '/lib/email/services/pepoCampaigns');

/**
 * Class to change contact status in pepo campaigns.
 *
 * @class ChangeContactStatus
 */
class ChangeContactStatus extends HookProcessorBase {
  /**
   * Constructor to update contact in pepo campaigns.
   *
   * @param {object} params
   * @param {object} params.hook: db record(hook) of EmailServiceApiCallHook table
   *
   * @augments HookProcessorsBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.hookParams = {};
  }

  /**
   * Validate params.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validate() {
    const oThis = this;

    oThis.hookParams = oThis.hook.params;

    if (!oThis.hookParams.status) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_ccs_v_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { hookParams: oThis.hookParams }
        })
      );
    }
  }

  /**
   * Process hook.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _processHook() {
    const oThis = this;

    const getEmailResponse = await oThis._getEmail(),
      emailDetails = getEmailResponse.data.emailDetails,
      email = emailDetails.email;

    const updateContactStatusResp = await pepoCampaignsWrapper.changeContactStatus(email, oThis.hookParams.status);

    if (updateContactStatusResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_ccs_ph_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: updateContactStatusResp }
        })
      );
    }

    return updateContactStatusResp;
  }
}

module.exports = ChangeContactStatus;
