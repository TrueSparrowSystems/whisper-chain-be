const rootPrefix = '../..',
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  RabbitMqEnqueueBase = require(rootPrefix + '/lib/rabbitMqEnqueue/Base'),
  CronProcessesDetailsByIdsCache = require(rootPrefix + '/lib/cacheManagement/multi/big/CronProcessesDetailsByIds'),
  ActiveUserSocketConnectionDetailsByUserIdsCache = require(rootPrefix +
    '/lib/cacheManagement/multi/socket/ActiveUserSocketConnectionDetailsByUserIds'),
  machineKindConstants = require(rootPrefix + '/lib/globalConstant/machineKind'),
  socketRabbitMqProvider = require(rootPrefix + '/lib/providers/socketRabbitMq'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy'),
  socketConnectionConstants = require(rootPrefix + '/lib/globalConstant/socket/socketConnection');

/**
 * Class for socket job enqueue.
 *
 * @class SocketEnqueue
 */
class SocketEnqueue extends RabbitMqEnqueueBase {
  /**
   * Get rabbitMq provider.
   *
   * @returns {string}
   */
  async getRmqProvider(socketIdentifier) {
    const cronProcessesCacheRsp = await new CronProcessesDetailsByIdsCache({ ids: [socketIdentifier] }).fetch(),
      cronProcessParams = cronProcessesCacheRsp.data[socketIdentifier].params;

    return socketRabbitMqProvider.getInstance(
      configStrategyConstants.socketRabbitmq,
      cronProcessParams.rmqCId,
      machineKindConstants.appServerKind
    );
  }

  /**
   * Publish to socket.
   * NOTE - This overrides 'enqueue' of base class.
   *
   * @param {object} params
   * @param {array<number>} params.recipient_user_ids: user ids
   * @param {object} params.payload: messagePayload to be published
   *
   * @returns {Promise<any[]>}
   */
  async publishToSocket(params) {
    const oThis = this;

    const userIds = params.recipient_user_ids,
      userSocketConnDetailsMap = {},
      socketEnqueuePromiseArray = [];

    const activeUserSocketConnectionDetailsCacheRsp = await new ActiveUserSocketConnectionDetailsByUserIdsCache({
        userIds: userIds
      }).fetch(),
      activeUserSocketConnectionDetailsMap = activeUserSocketConnectionDetailsCacheRsp.data;

    for (const userId in activeUserSocketConnectionDetailsMap) {
      const userSocketConnectionDetailsArr = activeUserSocketConnectionDetailsMap[userId];

      for (let uscdi = 0; uscdi < userSocketConnectionDetailsArr.length; uscdi++) {
        const userSocketConnectionDetail = userSocketConnectionDetailsArr[uscdi];
        if (CommonValidators.validateNonEmptyObject(userSocketConnectionDetail)) {
          const socketIdentifier = userSocketConnectionDetail.socketIdentifier;

          userSocketConnDetailsMap[socketIdentifier] = userSocketConnDetailsMap[socketIdentifier] || [];
          userSocketConnDetailsMap[socketIdentifier].push(userId);
        }
      }
    }

    for (const socketIdentifier in userSocketConnDetailsMap) {
      userSocketConnDetailsMap[socketIdentifier] = [...new Set(userSocketConnDetailsMap[socketIdentifier])];
      const messageParams = {
        userIds: userSocketConnDetailsMap[socketIdentifier],
        messagePayload: params.payload
      };
      const promise = oThis.enqueue(socketConnectionConstants.getSocketRmqTopic(socketIdentifier), messageParams, {
        socketIdentifier: socketIdentifier
      });
      socketEnqueuePromiseArray.push(promise);
    }

    return Promise.all(socketEnqueuePromiseArray);
  }
}

module.exports = new SocketEnqueue();
