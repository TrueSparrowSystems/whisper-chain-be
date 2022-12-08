const rootPrefix = '../..',
  awsSnsWrapper = require(rootPrefix + '/lib/aws/snsWrapper'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  smsHookConstant = require(rootPrefix + '/lib/globalConstant/big/smsHook');

/**
 * Class to process SMS hooks.
 *
 * @class SmsHookProcessor
 */
class SmsHookProcessor {
  /**
   * Constructor to process SMS hooks.
   *
   * @param {object} params
   * @param {object} params.hook - row of sms_hooks table
   */
  constructor(params) {
    const oThis = this;

    oThis.hook = params.hook;

    oThis.serviceMessageId = null;
  }

  /**
   * Perform.
   *
   * @returns {Promise<*|result>}
   */
  async perform() {
    const oThis = this;

    oThis._setMessage();

    await oThis._sendSms();

    return responseHelper.successWithData({ serviceMessageId: oThis.serviceMessageId });
  }

  /**
   * Set message.
   *
   * @sets oThis.message
   *
   * @private
   */
  _setMessage() {
    const oThis = this;

    logger.step('Setting the message to be sent');

    if (oThis.hook.messageKind === smsHookConstant.sampleMessageKind) {
      const message = oThis.hook.messagePayload.message;

      oThis.message = `Add custom fields to the ${message}`;
    } else {
      throw new Error(`unrecognized message kind: ${oThis.hook.messageKind}`);
    }

    logger.win('Message to be sent decided.');
  }

  /**
   * Send SMS.
   *
   * @sets oThis.serviceMessageId
   *
   * @returns {Promise<void>}
   * @private
   */
  async _sendSms() {
    const oThis = this;

    const phoneNumber = oThis.hook.phoneNumber;

    logger.step(`sending SMS to ${phoneNumber}`);

    const publishSmsResponse = await awsSnsWrapper.publishSms(phoneNumber, oThis.message);

    oThis.serviceMessageId = publishSmsResponse.data.serviceMessageId;

    logger.win(`SMS sent to ${phoneNumber}: ${oThis.serviceMessageId}`);
  }
}

module.exports = SmsHookProcessor;
