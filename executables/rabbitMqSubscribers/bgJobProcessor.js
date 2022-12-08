const program = require('commander');

const rootPrefix = '../..',
  RabbitMqProcessorBase = require(rootPrefix + '/executables/rabbitMqSubscribers/Base'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  rabbitMqProvider = require(rootPrefix + '/lib/providers/rabbitMq'),
  machineKindConstants = require(rootPrefix + '/lib/globalConstant/machineKind'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

program.option('--cronProcessId <cronProcessId>', 'Cron table process ID').parse(process.argv);

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node executables/rabbitMqSubscribers/bgJobProcessor.js --cronProcessId 33');
  logger.log('');
  logger.log('');
});

if (!program.opts().cronProcessId) {
  program.help();
  process.exit(1);
}

/**
 * Class for background job processor.
 *
 * @class BgJobProcessor
 */
class BgJobProcessor extends RabbitMqProcessorBase {
  /**
   * Get rabbitMq provider.
   *
   * @returns {string}
   */
  getRmqProvider() {
    return rabbitMqProvider.getInstance(configStrategyConstants.bgJobRabbitmq, machineKindConstants.cronKind);
  }

  /**
   * Returns cron kind.
   *
   * @return {string}
   * @private
   */
  get _cronKind() {
    return cronProcessesConstants.bgJobProcessor;
  }

  /**
   * Returns queue prefix.
   *
   * @returns {string}
   * @private
   */
  get _queuePrefix() {
    return 'bg_';
  }

  /**
   * Returns job processor factory.
   *
   * @returns {any}
   */
  get jobProcessorFactory() {
    return require(rootPrefix + '/lib/jobs/bg/factory');
  }
}

new BgJobProcessor({ cronProcessId: +program.opts().cronProcessId }).perform();

setInterval(function() {
  logger.info('Ending the process. Sending SIGINT.');
  process.emit('SIGINT');
}, cronProcessesConstants.continuousCronRestartInterval);
