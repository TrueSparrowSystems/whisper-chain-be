const { v4: uuidV4 } = require('uuid');

const rootPrefix = '../..',
  PhoneNumber = require(rootPrefix + '/lib/sms/PhoneNumber'),
  SmsRateLimit = require(rootPrefix + '/lib/cacheManagement/single/SmsRateLimit'),
  SmsHookModel = require(rootPrefix + '/app/models/mysql/big/SmsHook'),
  pinpointWrapper = require(rootPrefix + '/lib/aws/pinpointWrapper'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  awsSnsWrapper = require(rootPrefix + '/lib/aws/snsWrapper'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  smsHookConstant = require(rootPrefix + '/lib/globalConstant/big/smsHook');

class CreateSmsHook {
  /**
   * Constructor
   *
   * @param {string} phoneNumber - phone number including the country code, example '+919008420332'
   */
  constructor(phoneNumber) {
    const oThis = this;

    oThis.phoneNumber = phoneNumber;

    oThis.standardizedPhoneNumber = null;
    oThis.internalMessageId = null;
    oThis.message = null;
    oThis.sendRealSms = true; // In staging only some numbers will be whitelisted to receive SMS.
    oThis.phoneNumberToken = null;
  }

  /**
   * Perform
   *
   * @returns {Promise<*|result>}
   */
  async perform() {
    const oThis = this;

    await oThis._validatePhoneNumber();

    await oThis._checkRateLimit();

    await oThis._validateOptOut();

    await oThis._validateViaPinpoint();

    await oThis._setMessage();

    oThis._setInternalMessageId();

    await oThis._createHook();

    return responseHelper.successWithData({ message: oThis.message });
  }

  /**
   * Validate Phone Number
   *
   * @sets oThis.standardizedPhoneNumber
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validatePhoneNumber() {
    const oThis = this;

    const pn = new PhoneNumber(oThis.phoneNumber);
    pn.sanitize();

    let isValid = false;

    try {
      isValid = pn.isValid();
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'INVALID_PHONE_NUMBER',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            phoneNumber: oThis.phoneNumber
          }
        })
      );
    }

    if (!isValid) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'INVALID_PHONE_NUMBER',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            phoneNumber: oThis.phoneNumber
          }
        })
      );
    }

    oThis.standardizedPhoneNumber = pn.standardize();

    console.log('oThis.standardizedPhoneNumber____________', oThis.standardizedPhoneNumber);

    if (
      !basicHelper.isProduction() &&
      !coreConstants.NON_PRODUCTION_WHITELISTED_PHONE_NUMBERS.includes(oThis.standardizedPhoneNumber)
    ) {
      oThis.sendRealSms = false;
    }
  }

  /**
   * Check rate limit
   *
   * @returns {Promise<void>}
   * @private
   */
  async _checkRateLimit() {
    const oThis = this;

    await new SmsRateLimit({ phoneNumber: oThis.standardizedPhoneNumber }).checkLimit();
  }

  /**
   * Check if phone number is opted out or not.
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validateOptOut() {
    const oThis = this;

    if (!oThis.sendRealSms) {
      return; // No need to check.
    }

    const isOptedOutResponse = await awsSnsWrapper.isPhoneNumberOptedOut(oThis.phoneNumber);

    const isOptedOut = isOptedOutResponse.data.isOptedOut;

    if (isOptedOut) {
      const errorObj = responseHelper.error({
        internal_error_identifier: 'OPTED_OUT_PHONENUMBER',
        api_error_identifier: 'something_went_wrong',
        debug_options: {
          phoneNumber: oThis.phoneNumber
        }
      });

      logger.error(errorObj);

      return Promise.reject(errorObj);
    }
  }

  /**
   * Validate via pinpoint service
   *
   * @returns {Promise<never>}
   * @private
   */
  async _validateViaPinpoint() {
    const oThis = this;

    if (!oThis.sendRealSms) {
      return;
    }

    const phoneNumberResp = await pinpointWrapper.validatePhoneNumber(oThis.phoneNumber);
    logger.log('pinpoint---phoneNumberResp----', phoneNumberResp);

    if (phoneNumberResp.errorCode) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: phoneNumberResp.errorCode,
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            phoneNumber: oThis.phoneNumber
          }
        })
      );
    }
  }

  /**
   * Set Message
   *
   * @sets oThis.message
   *
   * @returns {Promise<void>}
   * @private
   */
  async _setMessage() {
    const oThis = this;

    if (!oThis.sendRealSms) {
      oThis.message = '1111';

      return; // No need to proceed.
    }

    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }

    let otp = '';
    for (let index = 0; index < 4; index++) {
      otp += getRandomInt(10);
    }

    oThis.message = otp;
  }

  /**
   * Set internal message id
   *
   * @sets oThis.internalMessageId
   *
   * @private
   */
  _setInternalMessageId() {
    const oThis = this;

    oThis.internalMessageId = uuidV4();
  }

  /**
   * Create SMS hook
   *
   * @sets oThis.message
   *
   * @returns {Promise<void>}
   * @private
   */
  async _createHook() {
    const oThis = this;

    const currentTs = basicHelper.getCurrentTimestampInSeconds();

    const status = oThis.sendRealSms
      ? smsHookConstant.invertedStatuses[smsHookConstant.pendingStatus]
      : smsHookConstant.invertedStatuses[smsHookConstant.successStatus];

    const insertResponse = await new SmsHookModel()
      .insert({
        phone_number: oThis.standardizedPhoneNumber,
        message_kind: smsHookConstant.invertedMessageKinds[smsHookConstant.sampleMessageKind],
        message_payload: JSON.stringify({ message: oThis.message }),
        status: status,
        execution_timestamp: currentTs,
        internal_message_id: oThis.internalMessageId
      })
      .fire();

    oThis.phoneNumberToken = `${insertResponse.insertId}:${oThis.internalMessageId}`;
  }
}

module.exports = CreateSmsHook;
