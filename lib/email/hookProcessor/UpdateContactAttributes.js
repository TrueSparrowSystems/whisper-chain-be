const rootPrefix = '../../..',
  HookProcessorBase = require(rootPrefix + '/lib/email/hookProcessor/Base'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  pepoCampaignsWrapper = require(rootPrefix + '/lib/email/services/pepoCampaigns');

/**
 * Class to update contact in pepo campaigns.
 *
 * @class UpdateContactAttributes
 */
class UpdateContactAttributes extends HookProcessorBase {
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

    oThis.customAttributes = {};
  }

  /**
   * Validate params.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validate() {
    // Do nothing.
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

    const updateContactResp = await pepoCampaignsWrapper.updateContactAttributes(
      coreConstants.PEPO_CAMPAIGN_MASTER_LIST,
      email,
      oThis.customAttributes
    );

    if (updateContactResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_uc_ph_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: updateContactResp }
        })
      );
    }

    return updateContactResp;
  }
}

module.exports = UpdateContactAttributes;
