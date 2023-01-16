const Queue = require('@moxiedotxyz/queue');

const rootPrefix = '../..',
  machineKindConstants = require(rootPrefix + '/lib/globalConstant/machineKind'),
  configStrategyProvider = require(rootPrefix + '/lib/providers/configStrategy');

/**
 * Class for RabbitMq provider.
 *
 * @class RabbitMqProvider
 */
class RabbitMqProvider {
  /**
   * Get instance.
   *
   * @param {string} rabbitMqKind
   * @param {string} machineKind
   *
   * @return {Promise<*>}
   */
  async getInstance(rabbitMqKind, machineKind) {
    const configResponse = await configStrategyProvider.getConfigForKind(rabbitMqKind);

    if (configResponse.isFailure()) {
      return Promise.reject(configResponse);
    }

    const rabbitMqConfig = Object.assign(
      {},
      configResponse.data[rabbitMqKind],
      machineKindConstants.rmqOptionsFor(machineKind),
      {
        enableRabbitmq: '1'
      }
    );

    return Queue.getInstance({
      rabbitmq: rabbitMqConfig
    });
  }
}

module.exports = new RabbitMqProvider();
