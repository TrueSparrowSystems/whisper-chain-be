const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

class RabbitSubscription {
  /**
   * @constructor
   *
   * @param {object} params
   * @param {string} params.rabbitmqKind
   * @param {string} params.topic
   * @param {string} params.queue
   * @param {string} params.prefetchCount
   *
   */
  constructor(params) {
    const oThis = this;

    oThis.rabbitmqKind = params.rabbitmqKind;
    oThis.topic = params.topic;
    oThis.queue = params.queue;
    oThis.prefetchCount = params.prefetchCount;

    oThis.promiseQueueManager = null;
    oThis.consumerTag = null;
    oThis.subscribed = 0;
  }

  /**
   * Mark as subscribed
   */
  markAsSubscribed() {
    const oThis = this;

    oThis.subscribed = 1;
  }

  /**
   * Check if subscribed
   *
   * @return {boolean}
   */
  isSubscribed() {
    const oThis = this;

    return oThis.subscribed === 1;
  }

  /**
   * Stop consumption
   *
   * @sets oThis.subscribed
   */
  stopConsumption() {
    const oThis = this;

    oThis.subscribed = 0;

    if (oThis.consumerTag) {
      logger.info(':: :: Cancelling consumption on tag', oThis.consumerTag);
      process.emit('CANCEL_CONSUME', oThis.consumerTag);
    }
  }

  /**
   * Set promise queue manager
   *
   * @param promiseQueueManager
   * @sets oThis.promiseQueueManager
   */
  setPromiseQueueManager(promiseQueueManager) {
    const oThis = this;

    oThis.promiseQueueManager = promiseQueueManager;
  }

  /**
   * Set consumer tag
   *
   * @param consumerTag
   * @sets oThis.consumerTag
   */
  setConsumerTag(consumerTag) {
    const oThis = this;

    oThis.consumerTag = consumerTag;
  }
}

module.exports = RabbitSubscription;
