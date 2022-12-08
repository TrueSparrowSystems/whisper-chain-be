const rootPrefix = '../../..',
  HookProcessorBase = require(rootPrefix + '/lib/email/hookProcessor/Base'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  pepoCampaignsWrapper = require(rootPrefix + '/lib/email/services/pepoCampaigns'),
  pepoCampaignsConstant = require(rootPrefix + '/lib/globalConstant/pepoCampaigns');

/**
 * Class to add new contact in pepo campaigns.
 *
 * @class AddContact
 */
class AddContact extends HookProcessorBase {
  /**
   * Constructor to add new contact in pepo campaigns.
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
   * @returns {Promise<void>}
   * @private
   */
  async _processHook() {
    const oThis = this;

    const getEmailResponse = await oThis._getEmail(),
      emailDetails = getEmailResponse.data.emailDetails,
      email = emailDetails.email;

    const addContactResp = await pepoCampaignsWrapper.addContact(
      coreConstants.PEPO_CAMPAIGN_MASTER_LIST,
      email,
      oThis.customAttributes,
      oThis._userSettings
    );

    if (addContactResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_ac_ph_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: addContactResp }
        })
      );
    }

    return addContactResp;
  }

  /**
   * Get user settings.
   *
   * @returns {{}}
   * @private
   */
  get _userSettings() {
    return {
      [pepoCampaignsConstant.doubleOptInStatusUserSetting]: pepoCampaignsConstant.verifiedValue,
      [pepoCampaignsConstant.subscribeStatusUserSetting]: pepoCampaignsConstant.subscribedValue
    };
  }
}

module.exports = AddContact;
