const rootPrefix = '../..',
  ConfigStrategyModel = require(rootPrefix + '/app/models/mysql/config/ConfigStrategy'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

const command = require('commander'),
  path = require('path'),
  appRootPath = path.resolve(__dirname, rootPrefix);

command
  .version('0.1.0')
  .usage('[options]')
  .option('-t, --activate-configs', 'Activate config')
  .option('-k, --kinds <required>', 'Act on specific kinds. Comma saperated kinds')
  .option('-f, --config-file-path <required>', 'Config file absolute path')
  .parse(process.argv);

/**
 * Class to create Config strategy
 *
 * @class
 */
class CreateUpdateConfigStrategy {
  /**
   *
   * Perform
   *
   * @return {Promise<result>}
   *
   */
  async perform() {
    const oThis = this;

    console.log('--------', command.opts().configFilePath);
    const configFilePath =
      command.opts().configFilePath === undefined
        ? `${appRootPath}/config-samples/development/global_config.json`
        : command.opts().configFilePath;

    const configData = require(configFilePath);
    oThis.config = configData.config;

    console.log('--------', command.opts().kinds);
    const kinds = command.opts().kinds ? command.opts().kinds.split(',') : Object.keys(oThis.config);

    for (const kind of kinds) {
      await oThis._validateKind(kind);

      const config = oThis.config[kind],
        last_modified_at = config.last_modified_at;

      if (!last_modified_at) {
        return Promise.reject(
          responseHelper.error({
            internal_error_identifier: 'd_e_cs_1',
            api_error_identifier: 'something_went_wrong',
            debug_options: { kind: kind, msg: 'Config file is outdated.' }
          })
        );
      }
      const existingStrategies = await new ConfigStrategyModel()
        .select('*')
        .where({ kind: configStrategyConstants.invertedKinds[kind] })
        .fire();
      const existingStrategy = existingStrategies[0];

      console.log('-existingStrategy-----------', existingStrategy);
      if (!existingStrategy) {
        await oThis._create(kind, { [kind]: config });
      } else if (last_modified_at > existingStrategy.updated_at) {
        await oThis._update(kind, { [kind]: config });
      } else if (
        command.opts().activateConfigs &&
        configStrategyConstants.statuses[existingStrategy.status] == configStrategyConstants.inActiveStatus
      ) {
        await oThis._activate(kind);
      }
    }
  }

  /**
   * Update Config Strategy.
   *
   * @param {string} kind: Config kind
   * @param {object} configParams: config JSON
   *
   * @returns {Promise<*>}
   * @private
   */
  async _update(kind, configParams) {
    logger.step(`** updating entry for ${kind} in config strategy.`);

    return new ConfigStrategyModel().updateStrategyByKind(kind, configParams);
  }

  /**
   * Create Config Strategy.
   *
   * @param {string} kind: Config kind
   * @param {object} configParams: config JSON
   *
   * @returns {Promise<*>}
   * @private
   */
  async _create(kind, configParams) {
    logger.step(`** Adding entry for ${kind} in config strategy.`);

    return new ConfigStrategyModel().create(kind, configParams);
  }

  /**
   * Activate Config Strategy.
   *
   * @param {string} kind: Config kind
   *
   * @returns {Promise<*>}
   * @private
   */
  async _activate(kind) {
    logger.step(`** Activating Config Strategy for ${kind}`);

    return new ConfigStrategyModel().activateByKind(kind);
  }

  /**
   * Validate kind.
   *
   * @param {string} kind: Config kind
   *
   * @returns {Promise<*>}
   * @private
   */
  async _validateKind(kind) {
    if (!configStrategyConstants.invertedKinds[kind]) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'd_e_cs_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { kind: kind, msg: 'invalid kind' }
        })
      );
    }
  }
}

const createUpdateConfigStrategy = new CreateUpdateConfigStrategy();

createUpdateConfigStrategy
  .perform()
  .then(function(data) {
    logger.win('\nMain data: ', data);
    process.exit(0);
  })
  .catch(function(err) {
    logger.error('\nMain error: ', err);
    process.exit(1);
  });
