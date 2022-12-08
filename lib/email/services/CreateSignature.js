const crypto = require('crypto'),
  queryString = require('qs');

/**
 * Class to create signature for Pepo Campaigns.
 *
 * @class CreateSignature
 */
class CreateSignature {
  /**
   * Return current date in RFC 3339 format.
   *
   * @param {Date} date
   *
   * @return {string}
   */
  static rfc3339(date) {
    /**
     * Pad the number.
     *
     * @param {number} number
     *
     * @returns {*}
     */
    function pad(number) {
      return number < 10 ? '0' + number : number;
    }

    /**
     * Get timezone offset.
     *
     * @param {number} offset
     *
     * @returns {string}
     */
    function timezoneOffset(offset) {
      if (offset === 0) {
        return 'Z';
      }
      const sign = offset > 0 ? '-' : '+';
      offset = Math.abs(offset);

      return sign + pad(Math.floor(offset / 60)) + ':' + pad(offset % 60);
    }

    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds()) +
      timezoneOffset(date.getTimezoneOffset())
    );
  }

  /**
   * Get base params.
   *
   * @param {string} endpoint
   * @param {object} queryParams
   * @param {string} secretKey
   *
   * @return {{requestTime: string, signature: *}}
   */
  static baseParams(endpoint, queryParams, secretKey) {
    const requestTime = CreateSignature.rfc3339(new Date());

    queryParams['request-time'] = requestTime;

    const stringToSign = `${endpoint}?${CreateSignature.formatQueryParams(queryParams)}`;

    const signature = CreateSignature.generateSignature(stringToSign, secretKey);

    return { requestTime, signature };
  }

  /**
   * Format query params.
   *
   * @param {object} queryParams
   *
   * @returns {*}
   */
  static formatQueryParams(queryParams) {
    const str = queryString.stringify(queryParams, {
      arrayFormat: 'brackets',
      sort: function(elementOne, elementTwo) {
        return elementOne.localeCompare(elementTwo);
      }
    });

    return CreateSignature.convertQueryString(str);
  }

  /**
   * Convert query string.
   *
   * @param {string} qs
   *
   * @returns {*|void|string}
   */
  static convertQueryString(qs) {
    const replaceChars = { '%20': '+', '~': '%7E' },
      regex = new RegExp(Object.keys(replaceChars).join('|'), 'g');

    return qs.replace(regex, function(match) {
      return replaceChars[match];
    });
  }

  /**
   * Generate Signature
   *
   * @param stringToSign
   * @param secretKey
   * @returns {string}
   */
  static generateSignature(stringToSign, secretKey) {
    return crypto
      .createHmac('sha256', secretKey)
      .update(stringToSign)
      .digest('hex');
  }
}

module.exports = CreateSignature;
