const fs = require('fs'),
  path = require('path');

const rootPrefix = '..',
  base64Helper = require(rootPrefix + '/lib/base64Helper'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  apiErrorConfig = require(rootPrefix + '/config/apiParams/apiErrorConfig'),
  v1ParamErrorConfig = require(rootPrefix + '/config/apiParams/v1/errorConfig'),
  webParamErrorConfig = require(rootPrefix + '/config/apiParams/web/errorConfig');

/**
 * Class for basic helper methods.
 *
 * @class BasicHelper
 */
class BasicHelper {
  /**
   * Get current timestamp in seconds.
   *
   * @return {number}
   */
  getCurrentTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Convert milliseconds to seconds.
   *
   * @param {number} ms
   * @returns {number}
   */
  convertMsToS(ms) {
    return Math.floor(ms / 1000);
  }

  /**
   * Get current timestamp in milliseconds.
   *
   * @return {number}
   */
  getCurrentTimestampInMilliseconds() {
    return new Date().getTime();
  }

  /**
   * Get current timestamp in minutes.
   *
   * @return {number}
   */
  getCurrentTimestampInMinutes() {
    return Math.floor(new Date().getTime() / (60 * 1000));
  }

  /**
   * Convert date to timestamp in milli-seconds.
   *
   * @param {string} dateStr
   *
   * @return {number} timestamp
   */
  dateToMilliSecondsTimestamp(dateStr) {
    return new Date(dateStr).getTime();
  }

  /**
   * Log date format.
   *
   * @returns {string}
   */
  logDateFormat() {
    const date = new Date();

    return (
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1) +
      '-' +
      date.getDate() +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes() +
      ':' +
      date.getSeconds() +
      '.' +
      date.getMilliseconds()
    );
  }

  /**
   * Get unique ordered array.
   *
   * @param {array} inputArray
   * @param {number} [limit]
   *
   * @returns {[]}
   */
  uniquate(inputArray, limit) {
    const uniqueMap = {},
      uniqueOrderedArray = [];
    let counter = 0;

    for (let index = 0; index < inputArray.length; index++) {
      const arrayElement = inputArray[index];
      if (!uniqueMap[arrayElement]) {
        counter++;
        uniqueMap[arrayElement] = 1;
        uniqueOrderedArray.push(arrayElement);
        if (counter === limit) {
          return uniqueOrderedArray;
        }
      }
    }

    return uniqueOrderedArray;
  }

  /**
   * Fetch Error Config.
   *
   * @param {string} apiVersion
   * @param {object} dynamicErrorConfig
   *
   * @return {object}
   */
  fetchErrorConfig(apiVersion, dynamicErrorConfig) {
    let paramErrorConfig;

    if (apiVersion === apiVersions.v1) {
      paramErrorConfig = dynamicErrorConfig
        ? Object.assign(dynamicErrorConfig, v1ParamErrorConfig)
        : v1ParamErrorConfig;
    } else if (apiVersion === apiVersions.web) {
      paramErrorConfig = dynamicErrorConfig
        ? Object.assign(dynamicErrorConfig, webParamErrorConfig)
        : webParamErrorConfig;
    } else {
      throw new Error(`Unsupported API Version ${apiVersion}`);
    }

    return {
      param_error_config: paramErrorConfig,
      api_error_config: apiErrorConfig
    };
  }

  /**
   * Checks whether the object is empty or not.
   *
   * @param {object} obj
   *
   * @return {boolean}
   */
  isEmptyObject(obj) {
    for (const property in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, property)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if environment is production.
   *
   * @return {boolean}
   */
  isProduction() {
    return coreConstants.environment === 'production';
  }

  /**
   * Check if environment is staging.
   *
   * @return {boolean}
   */
  isStaging() {
    return coreConstants.environment === 'staging';
  }

  /**
   * Check if environment is development.
   *
   * @return {boolean}
   */
  isDevelopment() {
    return coreConstants.environment === 'development';
  }

  /**
   * Convert a common separated string to array.
   *
   * @param {string} str
   *
   * @return {array}
   */
  commaSeparatedStrToArray(str) {
    return str.split(',').map((ele) => ele.trim());
  }

  /**
   * Ensure directory existence. If directory does not exist, create one.
   *
   * @param {string} filePath
   *
   * @returns {boolean}
   */
  ensureDirectoryExistence(filePath) {
    const oThis = this;

    const dirname = path.dirname(filePath);

    if (fs.existsSync(dirname)) {
      return true;
    }

    oThis.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);

    return true;
  }

  /**
   * Gives unique user name
   *
   * @param name
   * @returns {string}
   */
  getUniqueUserName(name) {
    return (
      name.substring(0, 6) +
      '-' +
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 4)
    );
  }

  /**
   * Get username from email.
   *
   * @param {string} email
   *
   * @return {string}
   */
  getUserNameFromEmail(email) {
    return email.trim().split('@')[0];
  }

  /**
   * Get firstName from email.
   *
   * @param {string} email
   *
   * @return {string}
   */
  getFirstNameFromEmail(email) {
    return email.trim().split('@')[0];
  }

  /**
   * Get a 6-digit OTP.
   *
   * @returns {number}
   */
  getOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  /**
   * Gives random alphanumeric string
   *
   * @returns {string}
   */
  getRandomAlphaNumericString() {
    return (
      Date.now()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  /**
   * Sleep for particular time.
   *
   * @param {number} ms: time in ms
   *
   * @returns {Promise<any>}
   */
  sleep(ms) {
    // eslint-disable-next-line no-console
    logger.log(`Sleeping for ${ms} ms.`);

    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Encrypt page identifier.
   *
   * @param {object} object
   *
   * @return {string}
   */
  encryptPageIdentifier(object) {
    return base64Helper.encode(JSON.stringify(object));
  }

  /**
   * Decrypt page identifier.
   *
   * @param {string} string
   *
   * @return {object}
   */
  decryptPageIdentifier(string) {
    return JSON.parse(base64Helper.decode(string));
  }

  /**
   * Create a duplicate object.
   *
   * @param {object} obj
   * @return {object}
   */
  deepDup(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Flatten array to one level.
   *
   * @param {array} arr
   * @returns {array}
   */
  flatten(arr) {
    const oThis = this;

    return arr.reduce(function(flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) ? oThis.flatten(toFlatten) : toFlatten);
    }, []);
  }

  /**
   * Compare two objects.
   *
   * @param {object} firstObject
   * @param {object} secondObject
   *
   * @returns {boolean}
   */
  compareObjects(firstObject, secondObject) {
    const oThis = this;

    const firstObjectCopy = oThis.deepDup(firstObject);
    const secondObjectCopy = oThis.deepDup(secondObject);

    for (const key in firstObjectCopy) {
      if (firstObjectCopy[key] != secondObjectCopy[key]) {
        return false;
      }
      delete secondObjectCopy[key];
    }
    for (const key in secondObjectCopy) {
      if (secondObjectCopy[key] != firstObjectCopy[key]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compare two arrays.
   *
   * @param {array} firstArray
   * @param {array} secondArray
   *
   * @returns {boolean}
   */
  compareArrays(firstArray, secondArray) {
    if (firstArray.length !== secondArray.length) {
      return false;
    }

    const lookupObject = {};

    for (let index = 0; index < firstArray.length; index++) {
      const ele = firstArray[index];

      lookupObject[ele] = lookupObject[ele] || 0;
      lookupObject[ele] += 1;
    }

    for (let index = 0; index < secondArray.length; index++) {
      const ele = secondArray[index];

      if (!lookupObject[ele] || lookupObject[ele] == 0) {
        return false;
      }

      lookupObject[ele] -= 1;
    }

    return true;
  }
}

module.exports = new BasicHelper();
