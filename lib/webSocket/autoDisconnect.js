const rootPrefix = '../..',
  webSocketCustomCache = require(rootPrefix + '/lib/webSocket/customCache'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class to auto disconnect socket connections.
 *
 * @class AutoDisconnect
 */
class AutoDisconnect {
  /**
   * Main performer for class.
   *
   * @param {number} timestamp
   *
   * @returns {boolean}
   */
  perform(timestamp) {
    const oThis = this;
    logger.log(
      'AutoDisconnecting::timeToUserSocketConnDetailsIdsMap==> ',
      webSocketCustomCache.timeToUserSocketConnDetailsIdsMap
    );
    if (timestamp) {
      const socketIds = webSocketCustomCache.getTimeToSocketIds(timestamp);
      oThis.disconnectAllSockets(timestamp, socketIds);
    } else {
      for (const ts in webSocketCustomCache.timeToUserSocketConnDetailsIdsMap) {
        const userSocketConnectionDetailsIds = webSocketCustomCache.timeToUserSocketConnDetailsIdsMap[ts];
        if (userSocketConnectionDetailsIds.length > 0) {
          oThis.disconnectAllSockets(ts, userSocketConnectionDetailsIds);
        } else {
          webSocketCustomCache.deleteTimeToSocketIds(ts);
        }
      }
    }

    return true;
  }

  /**
   * Disconnect all sockets.
   *
   * @param {number} timestamp
   * @param {array<number>}userSocketConnectionDetailsIds
   *
   * @returns {boolean}
   */
  disconnectAllSockets(timestamp, userSocketConnectionDetailsIds) {
    if (timestamp >= basicHelper.getCurrentTimestampInMinutes()) {
      return true;
    }

    for (let index = 0; index < userSocketConnectionDetailsIds.length; index++) {
      const socketId = userSocketConnectionDetailsIds[index],
        socketObj = webSocketCustomCache.getFromSocketIdToSocketObjMap(socketId);

      if (!socketObj) {
        webSocketCustomCache.deleteTimeToSocketIds(timestamp, socketId);
        continue;
      }

      // Give 1 minute buffer before trigger disconnect
      if (socketObj.socketExpiryAt < basicHelper.getCurrentTimestampInMinutes()) {
        logger.debug('\nDisconnect all sockets called');
        socketObj.emit('chat-stream', 'Connection Expired. Disconnected !!');
        socketObj.disconnect();
        webSocketCustomCache.deleteTimeToSocketIds(timestamp, socketId);
      }
    }

    return true;
  }
}

module.exports = new AutoDisconnect();
