require('https').globalAgent.keepAlive = true;

const AWS = require('aws-sdk'),
  instanceMap = {};

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

/**
 * Class for SNS Wrapper.
 *
 * @class SnsWrapper
 */
class SnsWrapper {
  /**
   * Publish SMS
   *
   * @param {string} phoneNumber - this is the complete phone number including the country code in E164 standard format
   * @param {string} message - message to be sent
   *
   * @returns {Promise<*|result>}
   */
  async publishSms(phoneNumber, message) {
    const oThis = this;

    const sns = oThis._getSnsInstance();

    let resErr = null;
    const resData = await sns
      .publish({
        Message: message,
        PhoneNumber: phoneNumber
      })
      .promise()
      .catch(function(err) {
        logger.error(err, err.stack);
        resErr = err;
      });

    if (resErr) {
      const errorObj = responseHelper.error({
        internal_error_identifier: 'PUBLISH_SMS_API_ERROR',
        api_error_identifier: 'something_went_wrong',
        debug_options: { phoneNumber: phoneNumber, message: message }
      });
      await createErrorLogsEntry.perform(errorObj, errorLogsConstants.highSeverity);

      logger.error(resErr);

      return Promise.reject(errorObj);
    }

    return responseHelper.successWithData({ serviceMessageId: resData.MessageId });
  }

  /**
   * Check if phone number is opted out
   *
   * @param {string} phoneNumber - this is the complete phone number including the country code in E164 standard format
   *
   * @returns {Promise<*|result>}
   */
  async isPhoneNumberOptedOut(phoneNumber) {
    const oThis = this;

    const sns = oThis._getSnsInstance();

    let resErr = null;

    const resData = await sns
      .checkIfPhoneNumberIsOptedOut({
        phoneNumber: phoneNumber
      })
      .promise()
      .catch(function(err) {
        logger.error(err, err.stack);
        resErr = err;
      });

    if (resErr) {
      const errorObj = responseHelper.error({
        internal_error_identifier: 'OPTED_OUT_API_ERROR',
        api_error_identifier: 'something_went_wrong',
        debug_options: { phoneNumber: phoneNumber }
      });
      await createErrorLogsEntry.perform(errorObj, errorLogsConstants.highSeverity);

      logger.error(resErr);

      return Promise.reject(errorObj);
    }

    return responseHelper.successWithData({ isOptedOut: resData.isOptedOut });
  }

  /**
   * Get AWS SNS for SMS instance for given region.
   *
   * @returns {*}
   * @private
   */
  _getSnsInstance() {
    const instanceKey = `${coreConstants.SNS_SMS_ACCESS_KEY_ID}`;

    const accessKeyIdVal = coreConstants.SNS_SMS_ACCESS_KEY_ID,
      secretAccessKeyVal = coreConstants.SNS_SMS_SECRET_ACCESS_KEY;

    if (!instanceMap[instanceKey]) {
      instanceMap[instanceKey] = new AWS.SNS({
        apiVersion: '2010-03-31', // Locking the API version
        region: coreConstants.SNS_SMS_REGION,
        accessKeyId: accessKeyIdVal,
        secretAccessKey: secretAccessKeyVal
      });
    }

    return instanceMap[instanceKey];
  }
}

module.exports = new SnsWrapper();
