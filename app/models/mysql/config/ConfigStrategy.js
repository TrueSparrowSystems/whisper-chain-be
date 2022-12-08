const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  localCipher = require(rootPrefix + '/lib/encryptors/localCipher'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  configStrategyValidator = require(rootPrefix + '/helpers/configStrategyValidator'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

const dbName = databaseConstants.configDbName,
  configStrategyKinds = configStrategyConstants.kinds;

/**
 * Class for config strategy model.
 *
 * @class ConfigStrategyModel
 */
class ConfigStrategyModel extends ModelBase {
  /**
   * Constructor for config strategy model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'config_strategies';
  }

  /**
   * Create record of config strategy.
   *
   * @param {string} kind
   * @param {object} allParams
   *
   * @returns {Promise<*>}
   */
  async create(kind, allParams) {
    const oThis = this;

    const strategyKindIntResp = configStrategyValidator.getStrategyKindInt(kind);

    if (strategyKindIntResp.isFailure()) {
      return Promise.reject(strategyKindIntResp);
    }

    const strategyKindInt = strategyKindIntResp.data;

    if (!allParams) {
      return oThis._customError('a_mo_m_cs_1', 'Config Strategy params hash cannot be null');
    }

    // Check if proper keys are present in all params
    if (!configStrategyValidator.validateConfigStrategy(kind, allParams)) {
      return oThis._customError('a_mo_m_cs_2', `Config params validation failed for: ${JSON.stringify(allParams)}`);
    }

    const separateHashesResponse = oThis._getSeparateHashes(kind, allParams);

    const hashToEncrypt = separateHashesResponse.hashToEncrypt,
      hashNotToEncrypt = separateHashesResponse.hashNotToEncrypt;

    let encryptedHash = null;

    if (hashToEncrypt) {
      const encryptedHashResponse = await oThis._getEncryption(hashToEncrypt);

      if (encryptedHashResponse.isFailure()) {
        return oThis._customError('a_mo_m_cs_3', 'Error while encrypting data');
      }
      encryptedHash = encryptedHashResponse.data;
    }

    const hashNotToEncryptString = JSON.stringify(hashNotToEncrypt);

    const insertData = {
      kind: strategyKindInt,
      encrypted_params: encryptedHash,
      unencrypted_params: hashNotToEncryptString,
      status: configStrategyConstants.invertedStatuses[configStrategyConstants.inActiveStatus]
    };

    const insertResult = await oThis.insert(insertData).fire();

    return responseHelper.successWithData(insertResult.insertId);
  }

  /**
   * Encrypt params using salt.
   *
   * @param {object} paramsToEncrypt
   *
   * @returns {Promise<result>}
   * @private
   */
  async _getEncryption(paramsToEncrypt) {
    const oThis = this;

    const encryptedConfigStrategyParams = localCipher.encrypt(
      coreConstants.CONFIG_STRATEGY_SALT,
      JSON.stringify(paramsToEncrypt)
    );

    return responseHelper.successWithData(encryptedConfigStrategyParams);
  }

  /**
   * Segregate encrypted and un-encrypted config hash.
   *
   * @param {string} strategyKindName
   * @param {object} configStrategyParams
   *
   * @returns {object}
   * @private
   */
  _getSeparateHashes(strategyKindName, configStrategyParams) {
    const hashToEncrypt = {},
      hashNotToEncrypt = configStrategyParams;

    let encryptedKeysFound = false;

    if (
      strategyKindName === configStrategyConstants.bgJobRabbitmq ||
      strategyKindName === configStrategyConstants.socketRabbitmq
    ) {
      const rmqPassword = hashNotToEncrypt[strategyKindName].password;

      hashNotToEncrypt[strategyKindName].password = '{{rmqPassword}}';
      hashToEncrypt.rmqPassword = rmqPassword;
      encryptedKeysFound = true;
    } else if (strategyKindName === configStrategyConstants.cassandra) {
      const cassandraPassword = hashNotToEncrypt[strategyKindName].password;

      hashNotToEncrypt[strategyKindName].password = '{{cassandraPassword}}';
      hashToEncrypt.cassandraPassword = cassandraPassword;
      encryptedKeysFound = true;
    } else if (strategyKindName === configStrategyConstants.websocket) {
      const wsAuthSalt = hashNotToEncrypt[strategyKindName].wsAuthSalt;

      hashNotToEncrypt[strategyKindName].wsAuthSalt = '{{wsAuthSalt}}';
      hashToEncrypt.wsAuthSalt = wsAuthSalt;
      encryptedKeysFound = true;
    }

    return {
      hashToEncrypt: encryptedKeysFound ? hashToEncrypt : null,
      hashNotToEncrypt: hashNotToEncrypt
    };
  }

  /**
   * Merge config strategy result.
   *
   * @param {string} strategyKind
   * @param {object} configStrategyHash
   * @param {object} decryptedJsonObj
   *
   * @returns {object}
   * @private
   */
  _mergeConfigResult(strategyKind, configStrategyHash, decryptedJsonObj) {
    switch (configStrategyKinds[strategyKind]) {
      case configStrategyConstants.bgJobRabbitmq:
      case configStrategyConstants.socketRabbitmq: {
        configStrategyHash[configStrategyKinds[strategyKind]].password = decryptedJsonObj.rmqPassword;
        break;
      }
      case configStrategyConstants.cassandra: {
        configStrategyHash[configStrategyKinds[strategyKind]].password = decryptedJsonObj.cassandraPassword;
        break;
      }
      case configStrategyConstants.websocket: {
        configStrategyHash[configStrategyKinds[strategyKind]].wsAuthSalt = decryptedJsonObj.wsAuthSalt;
        break;
      }

      default: {
        // Do nothing.
      }
    }

    return configStrategyHash;
  }

  /**
   * This method updates strategy by kind.
   *
   * @param {string} strategyKind
   * @param {object} configStrategyParams
   *
   * @returns {Promise<*>}
   */
  async updateStrategyByKind(strategyKind, configStrategyParams) {
    const oThis = this;

    const strategyKindIntResp = configStrategyValidator.getStrategyKindInt(strategyKind);

    if (strategyKindIntResp.isFailure()) {
      return Promise.reject(strategyKindIntResp);
    }

    const strategyKindInt = strategyKindIntResp.data;

    const queryResult = await new ConfigStrategyModel()
      .select(['kind'])
      .where({ kind: strategyKindInt })
      .fire();

    if (queryResult.length === 0) {
      return oThis._customError('a_mo_m_cs_7', 'Strategy id is invalid.');
    }

    const finalDataToInsertInDb = {},
      configStrategyKind = queryResult[0].kind,
      strategyKindName = configStrategyConstants.kinds[configStrategyKind];

    const validationResult = configStrategyValidator.validateConfigStrategy(strategyKindName, configStrategyParams);

    if (!validationResult) {
      return oThis._customError('a_mo_m_cs_8', 'Config validation failed');
    }

    // Segregate data to encrypt and data not to encrypt.
    const separateHashesResponse = oThis._getSeparateHashes(strategyKindName, configStrategyParams);

    const hashToEncrypt = separateHashesResponse.hashToEncrypt,
      hashNotToEncrypt = separateHashesResponse.hashNotToEncrypt;

    let encryptedHash = null;

    if (hashToEncrypt) {
      const encryptedHashResponse = await oThis._getEncryption(hashToEncrypt);

      if (encryptedHashResponse.isFailure()) {
        return oThis._customError('a_mo_m_cs_9', 'Error while encrypting data');
      }
      encryptedHash = encryptedHashResponse.data;
    }

    finalDataToInsertInDb.encrypted_params = encryptedHash;
    finalDataToInsertInDb.unencrypted_params = JSON.stringify(hashNotToEncrypt);

    await new ConfigStrategyModel()
      .update(finalDataToInsertInDb)
      .where({ kind: strategyKindInt })
      .fire();

    return responseHelper.successWithData({});
  }

  /**
   * Sets the status of given strategy kind as active.
   *
   * @param {string} kind
   *
   * NOTE - in-memory cache can have old data - restart needed after activation.
   *
   * @returns {Promise<*>}
   */
  async activateByKind(kind) {
    const oThis = this;

    const strategyKindIntResp = configStrategyValidator.getStrategyKindInt(kind);

    if (strategyKindIntResp.isFailure()) {
      return Promise.reject(strategyKindIntResp);
    }

    const strategyKindInt = strategyKindIntResp.data;

    const queryResponse = await oThis
      .update({
        status: configStrategyConstants.invertedStatuses[configStrategyConstants.activeStatus]
      })
      .where({ kind: strategyKindInt })
      .fire();

    if (!queryResponse) {
      return oThis._customError('a_mo_m_cs_10', 'Error in setStatusActive.');
    }

    if (queryResponse.affectedRows === 1) {
      logger.info(`Status of strategy kind: ${kind} is now active.`);

      return responseHelper.successWithData({});
    }

    return oThis._customError('a_mo_m_cs_11', 'Strategy kind not present in the table.');
  }

  /**
   * Get complete config strategy.
   *
   * @returns {Promise<*|result>}
   */
  async getCompleteConfigStrategy() {
    const oThis = this;

    const configStrategyRows = await oThis
      .select('*')
      .where({
        status: configStrategyConstants.invertedStatuses[configStrategyConstants.activeStatus]
      })
      .fire();

    const finalResult = {};

    for (let index = 0; index < configStrategyRows.length; index++) {
      const configStrategy = configStrategyRows[index];

      let localDecryptedJsonObj = {};

      if (configStrategy.encrypted_params) {
        const localDecryptedParams = localCipher.decrypt(
          coreConstants.CONFIG_STRATEGY_SALT,
          configStrategy.encrypted_params
        );
        localDecryptedJsonObj = JSON.parse(localDecryptedParams);
      }

      const configStrategyHash = JSON.parse(configStrategy.unencrypted_params);

      const mergedConfig = oThis._mergeConfigResult(configStrategy.kind, configStrategyHash, localDecryptedJsonObj);

      finalResult[configStrategyConstants.kinds[configStrategy.kind]] =
        mergedConfig[configStrategyConstants.kinds[configStrategy.kind]];
    }

    return responseHelper.successWithData(finalResult);
  }

  /**
   * Custom error.
   *
   * @param {string} errCode
   * @param {string} errMsg
   *
   * @returns {Promise<never>}
   * @private
   */
  _customError(errCode, errMsg) {
    logger.error(errMsg);

    return Promise.reject(
      responseHelper.error({
        internal_error_identifier: errCode,
        api_error_identifier: 'something_went_wrong',
        debug_options: { errMsg: errMsg }
      })
    );
  }
}

module.exports = ConfigStrategyModel;
