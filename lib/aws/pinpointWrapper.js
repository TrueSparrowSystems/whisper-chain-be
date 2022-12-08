const AWS = require('aws-sdk');

const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

class PinpointWrapper {
  /**
   * Validate phone number
   *
   * @param {string} phoneNumber - this is the complete phone number including the country code in E164 standard format e.g: +91 9087876512
   *
   * @returns {Promise<*|result>}
   */
  async validatePhoneNumber(phoneNumber) {
    const oThis = this;

    const pinpoint = oThis._getPinpointInstance();

    const resData = await pinpoint
      .phoneNumberValidate({
        NumberValidateRequest: {
          PhoneNumber: phoneNumber
        }
      })
      .promise()
      .catch(function(err) {
        logger.error(err, err.stack);

        return err;
      });

    logger.log('pinpoint_resData ==> ', resData);
    if (resData && resData.NumberValidateResponse) {
      const phoneTypeCode = resData.NumberValidateResponse.PhoneTypeCode;
      // Doc: https://docs.aws.amazon.com/pinpoint/latest/developerguide/validate-phone-numbers.html
      // Api Doc: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Pinpoint.html#phoneNumberValidate-property
      // Note: phoneTypeCode -> {0: 'MOBILE', 1: 'LANDLINE', 2: 'VOIP', 3: 'INVALID, 4: 'fictitious North American', 5: 'PREPAID'}

      if (phoneTypeCode == 1) {
        return { errorCode: 'LANDLINE_PHONE_NUMBER' };
      } else if (phoneTypeCode == 2) {
        return { errorCode: 'VOIP_PHONE_NUMBER' };
      } else if (phoneTypeCode == 3) {
        return { errorCode: 'INVALID_PHONE_NUMBER' };
      } else if (phoneTypeCode == 4) {
        return { errorCode: 'INVALID_PHONE_NUMBER' };
      } else if (phoneTypeCode == 5) {
        return { errorCode: 'PREPAID_PHONE_NUMBER' };
      }
    }

    return { errorCode: '' };
  }

  /**
   * Get AWS pinpoint instance for given region.
   *
   * @returns {*}
   * @private
   */
  _getPinpointInstance() {
    return new AWS.Pinpoint({
      apiVersion: '2016-12-01',
      region: coreConstants.AWS_PINPOINT_REGION
    });
  }
}

module.exports = new PinpointWrapper();
