const rootPrefix = '../..',
  SmsHookModel = require(rootPrefix + '/app/models/mysql/big/SmsHook'),
  PhoneNumber = require(rootPrefix + '/lib/sms/PhoneNumber'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  smsHookConstant = require(rootPrefix + '/lib/globalConstant/big/smsHook'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

class VerifyOtpAndPhoneNumberToken {
  /**
   * Constructor
   *
   * @param {string} phoneNumberToken
   * @param {string} otp
   */
  constructor(phoneNumberToken, otp) {
    const oThis = this;

    oThis.phoneNumberToken = phoneNumberToken;
    oThis.otp = otp;

    oThis.smsHookId = null;
    oThis.internalMessageIdFromInput = null;
    oThis.formattedSmsHookRow = null;
    oThis.standardizedNationalNumber = null;
    oThis.standardizedCountryCode = null;
  }

  /**
   * Perform
   *
   * @returns {Promise<*>}
   */
  async perform() {
    const oThis = this;

    await oThis._parsePhoneNumberToken();

    await oThis._fetchSmsHook();

    await oThis._validateSmsHook();

    await oThis._splitPhoneNumber();

    await oThis._changeStatusToVerifiedOtpStatus();

    return oThis._prepareResponse();
  }

  /**
   * Parse phone number token
   *
   * @sets oThis.smsHookId, oThis.internalMessageIdFromInput
   *
   * @returns {Promise<never>}
   * @private
   */
  async _parsePhoneNumberToken() {
    const oThis = this;

    const phoneNumberToken = (oThis.phoneNumberToken || '').toString();
    const tokenParts = phoneNumberToken.split(':');

    if (tokenParts.length != 2) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_s_vopnt_ppnt_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { phoneNumberToken: oThis.phoneNumberToken }
        })
      );
    }

    oThis.smsHookId = tokenParts[0];
    oThis.internalMessageIdFromInput = tokenParts[1];
  }

  /**
   * Fetch SMS Hook
   *
   * @sets oThis.formattedSmsHookRow
   *
   * @returns {Promise<never>}
   * @private
   */
  async _fetchSmsHook() {
    const oThis = this;

    const smsHookRow = (await new SmsHookModel()
      .select('*')
      .where({ id: oThis.smsHookId })
      .fire())[0];

    if (!smsHookRow) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_s_vopnt_fsh_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { phoneNumberToken: oThis.phoneNumberToken }
        })
      );
    }

    oThis.formattedSmsHookRow = new SmsHookModel().formatDbData(smsHookRow);
  }

  /**
   * Split Phone Number
   *
   * @sets oThis.standardizedNationalNumber, oThis.standardizedCountryCode
   * @private
   */
  async _splitPhoneNumber() {
    const oThis = this;

    const pn = new PhoneNumber(oThis.formattedSmsHookRow.phoneNumber);
    pn.sanitize();

    const splittedPhoneNumber = pn.getCountryCodeAndNationalNumber();

    oThis.standardizedNationalNumber = splittedPhoneNumber.nationalNumber;
    oThis.standardizedCountryCode = splittedPhoneNumber.countryCode;
  }

  /**
   * Validate SMS Hook
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validateSmsHook() {
    const oThis = this;

    const currentTs = basicHelper.getCurrentTimestampInSeconds();

    const isExpired = oThis.formattedSmsHookRow.createdAt < currentTs - 60 * 60; // Valid for 1 hour
    const isOtpIncorrect = oThis.formattedSmsHookRow.messagePayload.otp != oThis.otp;
    const isProperStatus =
      oThis.formattedSmsHookRow.status == smsHookConstant.successStatus ||
      oThis.formattedSmsHookRow.status == smsHookConstant.verifiedOtpStatus;

    if (isExpired || isOtpIncorrect || !isProperStatus) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_s_vopnt_vsh_1',
          api_error_identifier: 'invalid_otp',
          debug_options: { phoneNumberToken: oThis.phoneNumberToken, currentTs: currentTs }
        })
      );
    }
  }

  /**
   * Change status to verifiedOtpStatus of sms hook row
   *
   * @returns {Promise<never>}
   * @private
   */
  async _changeStatusToVerifiedOtpStatus() {
    const oThis = this;

    if (oThis.formattedSmsHookRow.status === smsHookConstant.verifiedOtpStatus) {
      return;
    }

    const updateResponse = await new SmsHookModel()
      .update({ status: smsHookConstant.invertedStatuses[smsHookConstant.verifiedOtpStatus] })
      .where({ id: oThis.smsHookId, status: smsHookConstant.invertedStatuses[smsHookConstant.successStatus] })
      .fire();

    if (updateResponse.changedRows != 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_s_vopnt_cstvos_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { phoneNumberToken: oThis.phoneNumberToken }
        })
      );
    }
  }

  /**
   * Prepare response
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _prepareResponse() {
    const oThis = this;

    return responseHelper.successWithData({
      isValid: 1,
      e164PhoneNumber: oThis.formattedSmsHookRow.phoneNumber,
      nationalNumber: oThis.standardizedNationalNumber,
      countryCode: oThis.standardizedCountryCode
    });
  }
}

module.exports = VerifyOtpAndPhoneNumberToken;
