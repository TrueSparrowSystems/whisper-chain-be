const rootPrefix = '../..',
  RabbitMqEnqueueBase = require(rootPrefix + '/lib/rabbitMqEnqueue/Base'),
  rabbitMqProvider = require(rootPrefix + '/lib/providers/rabbitMq'),
  machineKindConstants = require(rootPrefix + '/lib/globalConstant/machineKind'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

/**
 * Class for bg job enqueue.
 *
 * @class BgJobEnqueue
 */
class BgJobEnqueue extends RabbitMqEnqueueBase {
  /**
   * Get rabbitMq provider.
   *
   * @returns {string}
   */
  getRmqProvider() {
    return rabbitMqProvider.getInstance(configStrategyConstants.bgJobRabbitmq, machineKindConstants.appServerKind);
  }

  get jobProcessorFactory() {
    return require(rootPrefix + '/lib/jobs/bg/factory');
  }
}

module.exports = new BgJobEnqueue();
