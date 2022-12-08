const rootPrefix = '..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  configTemplate = require(rootPrefix + '/config/configStrategyTemplate'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

/**
 * Class to validate config strategy.
 *
 * @class ConfigStrategyValidator
 */
class ConfigStrategyValidator {
  /**
   * Get config strategy integer value.
   *
   * @param {string} kind
   *
   * @returns {result}
   */
  getStrategyKindInt(kind) {
    const strategyKindIntValue = configStrategyConstants.invertedKinds[kind];

    if (!strategyKindIntValue) {
      return responseHelper.error({
        internal_error_identifier: 'h_csv_1',
        api_error_identifier: 'something_went_wrong',
        debug_options: { kind: kind }
      });
    }

    return responseHelper.successWithData(strategyKindIntValue);
  }

  /**
   * This function returns true if the given configuration is as per the template format.
   *
   * @param {string} entityName //eg. entityName=cacheEntity
   * @param {object} configuration //eg. configuration[key] = {"engine":"memcache" ....}
   *
   * @returns {boolean}
   */
  validateConfigStrategy(entityName, configuration) {
    const oThis = this;

    const rootLevelEntities = configTemplate.rootLevelEntities,
      entitiesMap = configTemplate.entitiesMap;

    let returnFlag = true;
    const configEntityName = rootLevelEntities[entityName];

    if (!configEntityName || !entitiesMap[configEntityName]) {
      returnFlag = false;
    } else {
      logger.log('configuration[entityName]-----', configuration[entityName]);
      logger.log('entitiesMap[configEntityName]-----', entitiesMap[configEntityName]);

      if (entitiesMap[configEntityName].entityType === 'object') {
        returnFlag = returnFlag && oThis._validateObjectTypeEntity(configEntityName, configuration[entityName]);
      } else if (entitiesMap[configEntityName].entityType === 'array') {
        returnFlag = returnFlag && oThis._validateArrayTypeEntity(configEntityName, configuration[entityName]);
      } else if (entitiesMap[configEntityName].entityType === 'string') {
        if (!oThis._validateStringTypeEntity(configuration[entityName])) {
          logger.error(`${configEntityName} value should be string at root level`);
          returnFlag = false;
        }
      } else if (entitiesMap[configEntityName].entityType === 'number') {
        if (!oThis._validateNumberTypeEntity(configuration[entityName])) {
          logger.error(`${configEntityName} value should be number at root level`);
          returnFlag = false;
        }
      }
    }

    return returnFlag;
  }

  /**
   * Validate object entity type.
   *
   * @param {string} entityName
   * @param {object} configToValidate
   *
   * @returns {boolean}
   * @private
   */
  _validateObjectTypeEntity(entityName, configToValidate) {
    const oThis = this;

    const entitiesMap = configTemplate.entitiesMap;

    let returnFlag = true;

    // Validation if the configToValidate is present and it is an object.
    if (!configToValidate || typeof configToValidate !== 'object') {
      logger.error(`${configToValidate} : ${entityName} is either not present or it is not an object.`);
      returnFlag = false;

      return returnFlag;
    }
    for (const secondLevelEntity in entitiesMap[entityName].entitiesPresent) {
      // Eg. secondLevelEntity = "engine"
      const secondLevelEntityName = entitiesMap[entityName].entitiesPresent[secondLevelEntity];
      // Eg. secondLevelEntityName = "engineEntity"

      if (entitiesMap[secondLevelEntityName].entityType === 'string') {
        if (!oThis._validateStringTypeEntity(configToValidate[secondLevelEntity])) {
          logger.error(`${secondLevelEntity} value should be string in ${entityName}`);
          returnFlag = false;
        }
      } else if (entitiesMap[secondLevelEntityName].entityType === 'number') {
        if (!oThis._validateNumberTypeEntity(configToValidate[secondLevelEntity])) {
          logger.error(`${secondLevelEntity} value should be number in ${entityName}`);
          returnFlag = false;
        }
      } else if (entitiesMap[secondLevelEntityName].entityType === 'object') {
        returnFlag =
          returnFlag && oThis._validateObjectTypeEntity(secondLevelEntityName, configToValidate[secondLevelEntity]);
      } else if (entitiesMap[secondLevelEntityName].entityType === 'array') {
        returnFlag =
          returnFlag && oThis._validateArrayTypeEntity(secondLevelEntityName, configToValidate[secondLevelEntity]);
      }
    }

    return returnFlag;
  }

  /**
   * Validate array type entity.
   *
   * @param {string} entityName
   * @param {object} configToValidate
   *
   * @returns {boolean}
   * @private
   */
  _validateArrayTypeEntity(entityName, configToValidate) {
    // Eg. entityName = serversEntity
    // Eg. configToValidate = ["127.0.0.1","127.0.0.2"]
    const oThis = this;

    const entitiesMap = configTemplate.entitiesMap;

    let returnFlag = true;

    if (!configToValidate || !(configToValidate instanceof Array)) {
      logger.error(`${entityName} is either not present or it is not an array.`);

      return false;
    }

    const nameOfEntitiesPresentInArray = entitiesMap[entityName].entitiesPresent, // Eg. serverEntity
      typeOfEntitiesPresentInArray = entitiesMap[nameOfEntitiesPresentInArray].entityType; // Eg. string

    for (const index in configToValidate) {
      if (typeOfEntitiesPresentInArray === 'string') {
        if (!oThis._validateStringTypeEntity(configToValidate[index])) {
          logger.error(`${configToValidate} value should be an array strings in ${entityName}`);
          returnFlag = false;
        }
      } else if (typeOfEntitiesPresentInArray === 'number') {
        if (!oThis._validateNumberTypeEntity(configToValidate[index])) {
          logger.error(`${configToValidate[index]} value should be an array of numbers in ${entityName}`);
          returnFlag = false;
        }
      } else if (typeOfEntitiesPresentInArray === 'object') {
        returnFlag =
          returnFlag && oThis._validateObjectTypeEntity(nameOfEntitiesPresentInArray, configToValidate[index]); // Eg. entityName=nodeEntity configToValidate[index] = {client:"geth"...}
      } else if (typeOfEntitiesPresentInArray === 'array') {
        returnFlag =
          returnFlag && oThis._validateArrayTypeEntity(nameOfEntitiesPresentInArray, configToValidate[index]);
      }
    }

    return returnFlag;
  }

  /**
   * Check value type and if required value content also.
   *
   * @param {string} entityValue
   *
   * @returns {boolean}
   *
   * @private
   */
  _validateStringTypeEntity(entityValue) {
    return typeof entityValue === 'string';
  }

  /**
   * Validate number type entity.
   *
   * @param {number} value
   *
   * @returns {boolean}
   * @private
   */
  _validateNumberTypeEntity(value) {
    return value && typeof value === 'number';
  }
}

module.exports = new ConfigStrategyValidator();
