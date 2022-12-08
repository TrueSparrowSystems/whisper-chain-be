const rootPrefix = '../../..',
  HookProcessorBase = require(rootPrefix + '/lib/email/hookProcessor/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  pepoCampaignsWrapper = require(rootPrefix + '/lib/email/services/pepoCampaigns'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Class for hook processor for sending transactional mail.
 *
 * @class SendTransactionalMail
 */
class SendTransactionalMail extends HookProcessorBase {
  /**
   * Constructor for hook processor for sending transactional mail.
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

    if (!oThis.sendMailParams.templateVars) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_stm_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { sendMailParams: oThis.sendMailParams }
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
      emailDetails = getEmailResponse.data.emailDetails;

    if (emailDetails.blockedStatus) {
      return responseHelper.successWithData({ failedHookToBeIgnored: 1 });
    }

    const email = emailDetails.email;

    const sendTransactionMailResp = await pepoCampaignsWrapper.sendTransactionalMail(
      email,
      oThis.sendMailParams.templateName,
      oThis.sendMailParams.templateVars,
      emailServiceApiCallHookConstants.pepoCampaignAccountKind(oThis.sendMailParams.templateName)
    );

    if (sendTransactionMailResp.isFailure()) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hp_stm_ph_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { errorMsg: sendTransactionMailResp }
        })
      );
    }

    return sendTransactionMailResp;
  }
}

module.exports = SendTransactionalMail;
