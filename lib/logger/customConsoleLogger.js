const PkgBase = require('@moxiedotxyz/base'),
  Logger = PkgBase.Logger;

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants');

/**
 * Class for custom console logger.
 *
 * @class LoggerExtended
 */
class LoggerExtended extends Logger {}

// Following is to ensure that INFO logs are printed when debug is off.
let loggerLevel;
const envVal = coreConstants.DEFAULT_LOG_LEVEL;
const strEnvVal = String(envVal).toUpperCase();

if (Object.prototype.hasOwnProperty.call(Logger.LOG_LEVELS, strEnvVal)) {
  loggerLevel = Logger.LOG_LEVELS[strEnvVal];
} else {
  loggerLevel = Logger.LOG_LEVELS.INFO;
}

module.exports = new LoggerExtended(coreConstants.APP_NAME, loggerLevel);
