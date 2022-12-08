const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

/**
 * Class to parse and sanitize phone numbers. Currently using it just for US numbers.
 *
 * @class PhoneNumber
 */
class PhoneNumber {
  /**
   * Constructor to parse and sanitize phone numbers. Currently using it just for US numbers.
   *
   * @param {string} phoneNumber - phone number including the country code, example '+1-541-754-3010' or '+15417543010'
   */
  constructor(phoneNumber) {
    const oThis = this;

    oThis.phoneNumber = phoneNumber;
  }

  /**
   * Is valid phone number?
   *
   * @returns {boolean}
   */
  isValid() {
    const oThis = this;

    try {
      const number = phoneUtil.parseAndKeepRawInput(oThis.phoneNumber);

      return phoneUtil.isValidNumber(number);
    } catch (err) {
      oThis.sanitize();

      if (oThis._isUsNumber()) {
        return true;
      }

      // For non US numbers, we do not have regex.
      return false;
    }
  }

  /**
   * Standardize the phone number format
   *
   * @returns {string} returns phone number in E164 format
   */
  standardize() {
    const oThis = this;

    try {
      const number = phoneUtil.parseAndKeepRawInput(oThis.phoneNumber);

      return phoneUtil.format(number, PNF.E164);
    } catch (err) {
      oThis.sanitize();

      if (oThis._isUsNumber()) {
        return oThis.phoneNumber; // We have sanitized it to E164 format.
      }

      // For non US numbers, we do not have backup.
      throw err;
    }
  }

  /**
   * Get country code and national number
   *
   * @returns {{nationalNumber: number, countryCode: number}}
   */
  getCountryCodeAndNationalNumber() {
    const oThis = this;

    try {
      const number = phoneUtil.parseAndKeepRawInput(oThis.phoneNumber);

      return {
        countryCode: number.getCountryCode(),
        nationalNumber: number.getNationalNumber()
      };
    } catch (err) {
      oThis.sanitize();

      if (oThis._isUsNumber()) {
        return {
          countryCode: 1,
          nationalNumber: Number(oThis.phoneNumber.replace('+1', ''))
        };
      }

      // For non US numbers, we do not have backup.
      throw err;
    }
  }

  /**
   * Sanitize
   */
  sanitize() {
    const oThis = this;

    oThis.phoneNumber = oThis.phoneNumber.replace(/[^\d]/g, '');
    oThis.phoneNumber = '+' + oThis.phoneNumber;
  }

  /**
   * Is US Phone number
   *
   * @returns {boolean}
   * @private
   */
  _isUsNumber() {
    const oThis = this;

    return oThis.phoneNumber.startsWith('+1') && oThis.phoneNumber.length === 12;
  }
}

module.exports = PhoneNumber;
