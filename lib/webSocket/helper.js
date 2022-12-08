const rootPrefix = '../..',
  UserSocketConnectionDetailModel = require(rootPrefix + '/app/models/mysql/socket/UserSocketConnectionDetail'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  webSocketCustomCache = require(rootPrefix + '/lib/webSocket/customCache'),
  webSocketMessageConstants = require(rootPrefix + '/lib/globalConstant/webSocketMessage');

const expiryExtentionTimeInMinutes = 1;
let allTasksDone = false;

class webSocketServerHelper {
  /**
   * On socket connection steps.
   *
   * @param userId
   * @param userSocketConnDetailsId
   * @param apiVersion
   * @param socket
   * @returns {Promise<void>}
   */
  async onSocketConnection(userId, userSocketConnDetailsId, apiVersion, socket) {
    const oThis = this;

    const socketExtentionTime = oThis.getSocketExtentionTime();

    socket.userId = userId;
    socket.userSocketConnDetailsId = userSocketConnDetailsId;
    socket.apiVersion = apiVersion;
    socket.socketExpiryAt = socketExtentionTime;

    webSocketCustomCache.setSocketIdToSocketObjMap(userSocketConnDetailsId, socket);
    webSocketCustomCache.setIntoUserSocketIdsMap(userId, userSocketConnDetailsId);
    webSocketCustomCache.setTimeToSocketIds(socketExtentionTime, userSocketConnDetailsId);

    socket.emit('chat-stream', JSON.stringify({ 'Bot: ': 'New connection has been established!!' }));

    const currentTimeInMs = basicHelper.getCurrentTimestampInMilliseconds();
    const onConnectPayload = {
      kind: webSocketMessageConstants.socketConnected,
      payload: {
        socket_init_params: { id: userId, server_timestamp: currentTimeInMs, uts: currentTimeInMs }
      }
    };
    socket.emit('chat-stream', JSON.stringify(onConnectPayload));

    logger.info(
      `Socket connection established for userId: ${userId} with userSocketConnDetailsId: ${userSocketConnDetailsId}`
    );
  }

  /**
   * Associate events on socket.
   *
   * @param socket
   * @returns {Promise<void>}
   */
  async associateEvents(socket) {
    const oThis = this;

    socket.on('disconnect', async function() {
      logger.trace('Socket on-disconnect called. ');
      await oThis.onSocketDisconnect(socket);
    });

    socket.on('chat-stream', async function(packet) {
      logger.trace('Socket event received');
      await oThis.onEventActionPerformer(socket, packet);
    });

    socket.conn.on('packet', async function(packet) {
      if (packet.type === 'ping') {
        await oThis.onPingPacket(socket);
      }
    });
  }

  /**
   * On event action performer.
   *
   * @param socket
   * @param packet
   * @returns {Promise<boolean>}
   */
  async onEventActionPerformer(socket, packet) {
    logger.log('onEventActionPerformer:: packet received==> ', JSON.stringify(packet));

    const response = responseHelper.successWithData({
      'Bot: ': packet + ' @time:' + Math.round(Date.now() / 1000)
    });

    socket.emit('chat-stream', JSON.stringify(response));

    return true;
  }

  /**
   * On socket disconnect actions.
   *
   * @param socket
   * @returns {Promise<boolean>}
   */
  async onSocketDisconnect(socket) {
    const userSocketConnDetailsId = socket.userSocketConnDetailsId,
      userId = socket.userId;

    if (!userSocketConnDetailsId) {
      return true;
    }

    await new UserSocketConnectionDetailModel()._markSocketConnectionDetailsAsExpired(
      [userSocketConnDetailsId],
      [userId]
    );

    webSocketCustomCache.deleteFromSocketIdToSocketObjMap(userSocketConnDetailsId);

    webSocketCustomCache.deleteFromUserSocketIdsMap(userId, userSocketConnDetailsId);

    return true;
  }

  /**
   * Updates expiry at every new ping packet.
   *
   * @param socket
   * @returns {Promise<void>}
   */
  async onPingPacket(socket) {
    const oThis = this;

    logger.log(
      'onPingPacket::Received Ping for socket with userSocketConnDetailsId=====> ',
      socket.userSocketConnDetailsId
    );

    const userSocketConnDetailsId = socket.userSocketConnDetailsId,
      currentTime = socket.socketExpiryAt,
      newTime = oThis.getSocketExtentionTime();

    if (currentTime < newTime) {
      socket.socketExpiryAt = newTime;
      webSocketCustomCache.deleteTimeToSocketIds(currentTime, userSocketConnDetailsId);
      webSocketCustomCache.setTimeToSocketIds(newTime, userSocketConnDetailsId);
    }
  }

  /**
   * Pending task done.
   *
   * @returns {boolean}
   */
  pendingTasksDone() {
    const oThis = this;

    if (webSocketCustomCache.checkStopConnectingSockets()) {
      return allTasksDone;
    } else {
      webSocketCustomCache.markStopConnectingSockets();
      oThis.completePendingTask().then(function() {
        allTasksDone = true;
      });

      return allTasksDone;
    }
  }

  /**
   * Complete pending tasks.
   *
   * @returns {Promise<boolean>}
   */
  async completePendingTask() {
    const socketConnDetailsIds = [],
      userIds = [];

    for (const socketId in webSocketCustomCache.socketIdToSocketObjMap) {
      const socketObj = webSocketCustomCache.getFromSocketIdToSocketObjMap(socketId);
      socketObj.emit('chat-stream', 'Force Disconnecting !!');
      socketObj.disconnect();
    }

    logger.log(
      'completePendingTask:: userSocketConnDetailsIdsMap==> ',
      webSocketCustomCache.userSocketConnDetailsIdsMap
    );
    for (const userId in webSocketCustomCache.userSocketConnDetailsIdsMap) {
      userIds.push(userId);
      socketConnDetailsIds.concat(webSocketCustomCache.userSocketConnDetailsIdsMap[userId]);
    }

    logger.log('completePendingTask:: socketConnDetailsIds==> ', socketConnDetailsIds);
    if (socketConnDetailsIds.length > 0) {
      await new UserSocketConnectionDetailModel()._markSocketConnectionDetailsAsExpired(socketConnDetailsIds, userIds);
    }

    return true;
  }

  /**
   * Get Socket extension time.
   *
   * @returns {number}
   */
  getSocketExtentionTime() {
    return basicHelper.getCurrentTimestampInMinutes() + 2 * expiryExtentionTimeInMinutes;
  }
}

module.exports = new webSocketServerHelper();
