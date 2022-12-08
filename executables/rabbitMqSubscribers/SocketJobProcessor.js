const rootPrefix = '../..',
  RabbitMqProcessorBase = require(rootPrefix + '/executables/rabbitMqSubscribers/Base'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  webSocketServerHelper = require(rootPrefix + '/lib/webSocket/helper'),
  machineKindConstants = require(rootPrefix + '/lib/globalConstant/machineKind'),
  socketRabbitMqProvider = require(rootPrefix + '/lib/providers/socketRabbitMq'),
  WebSocketEventEmitter = require(rootPrefix + '/lib/webSocket/WebSocketEventEmitter'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

/**
 * Class for socket job processor.
 *
 * @class SocketJobProcessor
 */
class SocketJobProcessor extends RabbitMqProcessorBase {
  /**
   * Get rabbitMq provider.
   *
   * @returns {string}
   */
  getRmqProvider() {
    const oThis = this;

    return socketRabbitMqProvider.getInstance(
      configStrategyConstants.socketRabbitmq,
      oThis.rmqCId, // This is available in cronProcesses table's params column.
      machineKindConstants.cronKind
    );
  }

  /**
   * Returns cron kind.
   *
   * @return {string}
   * @private
   */
  get _cronKind() {
    return cronProcessesConstants.socketJobProcessor;
  }

  /**
   * Returns queue prefix.
   *
   * @returns {string}
   * @private
   */
  get _queuePrefix() {
    return '';
  }

  /**
   * This function checks if there are any pending tasks left or not.
   *
   * @returns {Boolean}
   */
  _pendingTasksDone() {
    const rmqTaskDone = super._pendingTasksDone();
    const websocketTaskDone = webSocketServerHelper.pendingTasksDone();
    logger.log('rmqTaskDone-----', rmqTaskDone);
    logger.log('websocketTaskDone-----', websocketTaskDone);

    return !!(rmqTaskDone && websocketTaskDone);
  }

  /**
   * Process message.
   *
   * NOTE - This overrides the base class implementation.
   *
   * @param {object} messageParams
   * @param {object} messageParams.message
   * @param {object} messageParams.message.payload
   * @param {array} messageParams.message.payload.userIds
   * @param {object} messageParams.message.payload.messagePayload
   *
   * @returns {Promise<>}
   *
   * @private
   */
  async _processMessage(messageParams) {
    logger.log('SocketJobProcessor::RabbitMQ messageParams=====>', JSON.stringify(messageParams));

    const messageDetails = messageParams.message.payload,
      userIds = messageDetails.userIds,
      messagePayload = messageDetails.messagePayload;

    await new WebSocketEventEmitter({ userIds: userIds, messagePayload: messagePayload }).perform();

    return Promise.resolve({});
  }
}

module.exports = SocketJobProcessor;
