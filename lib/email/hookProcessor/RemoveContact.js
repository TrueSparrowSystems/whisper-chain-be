const rootPrefix = '../../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  HookProcessorBase = require(rootPrefix + '/lib/email/hookProcessor/Base'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  pepoCampaignsWrapper = require(rootPrefix + '/lib/email/services/pepoCampaigns'),
  pepoCampaignsConstant = require(rootPrefix + '/lib/globalConstant/pepoCampaigns');

/**
 * Class to remove contact from pepo campaigns.
 *
 * @class RemoveContact
 */
class RemoveContact extends HookProcessorBase {
  /**
   * Constructor for hook processor to remove contact from pepo campaigns.
   *
   * @param {object} params
   * @param {hash} params.hook
   *
   * @augments HookProcessorBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.sendMailParams = {};
  }

  /**
   * Validate params.
   *
   * @sets oThis.sendMailParams
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validate() {
    const oThis = this;

    oThis.sendMailParams = oThis.hook.params;

    if (
      CommonValidators.validateNonEmptyObject(oThis.sendMailParams.templateVars) &&
      !oThis.sendMailParams.templateVars.receiverEmail
    ) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_rc_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { templateVars: oThis.sendMailParams.templateVars }
        })
      );
    }
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

    // Mark user double_opt_in_status = pending and subscribe_status = unsubscribed
    // The api updates contact with new status values
    const updateContactStatusResp = await pepoCampaignsWrapper.addContact(
      coreConstants.PEPO_CAMPAIGN_MASTER_LIST,
      email,
      {},
      oThis._userSettings
    );

    if (updateContactStatusResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_rc_ph_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: updateContactStatusResp }
        })
      );
    }

    const removeContactFromListResp = await pepoCampaignsWrapper.removeContact(
      coreConstants.PEPO_CAMPAIGN_MASTER_LIST,
      email
    );

    if (removeContactFromListResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_rc_ph_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: removeContactFromListResp }
        })
      );
    }

    return removeContactFromListResp;
  }

  /**
   * Get user settings.
   *
   * @returns {{}}
   * @private
   */
  get _userSettings() {
    return {
      [pepoCampaignsConstant.doubleOptInStatusUserSetting]: pepoCampaignsConstant.pendingValue,
      [pepoCampaignsConstant.subscribeStatusUserSetting]: pepoCampaignsConstant.unsubscribedValue
    };
  }
}

module.exports = RemoveContact;
