const userSocketConnDetailsIdsMap = {},
  _socketIdToSocketObjMap = {},
  timeToUserSocketConnDetailsIdsMap = {};

/**
 * Class for web socket custom cache.
 *
 * @class WebSocketCustomCache
 */
class WebSocketCustomCache {
  /**
   * Constructor for web socket custom cache.
   *
   * @constructor
   */
  constructor() {
    const oThis = this;

    oThis.stopConnectingSockets = false;
  }

  /**
   * Socket id to socket obj map.
   */
  get socketIdToSocketObjMap() {
    return _socketIdToSocketObjMap;
  }

  /**
   * User Id to user socket connection details table id map.
   *
   */
  get userSocketConnDetailsIdsMap() {
    return userSocketConnDetailsIdsMap;
  }

  /**
   * Timestamp to user socket connection details table id map.
   */
  get timeToUserSocketConnDetailsIdsMap() {
    return timeToUserSocketConnDetailsIdsMap;
  }

  // START :: Operations on "_socketIdToSocketObjMap".

  /**
   * Get socket object by socket id.
   *
   * @param socketId
   * @returns {*}
   */
  getFromSocketIdToSocketObjMap(socketId) {
    const oThis = this;

    return oThis.socketIdToSocketObjMap[socketId];
  }

  /**
   * Set socket objects map.
   *
   * @param socketId
   * @param socketObj
   * @returns {boolean}
   */
  setSocketIdToSocketObjMap(socketId, socketObj) {
    const oThis = this;

    oThis.socketIdToSocketObjMap[socketId] = socketObj;

    return true;
  }

  /**
   * Delete from socket objects map for given socket id.
   *
   * @param socketId
   * @returns {boolean}
   */
  deleteFromSocketIdToSocketObjMap(socketId) {
    const oThis = this;

    delete oThis.socketIdToSocketObjMap[socketId];

    return true;
  }

  // END :: Operations on "_socketIdToSocketObjMap".

  // START :: Operations on "userSocketConnDetailsIdsMap".

  /**
   * Get user socket connection details table id by user id.
   *
   * @param userId
   * @returns {*}
   */
  getFromUserSocketConnDetailsIdsMap(userId) {
    const oThis = this;

    return oThis.userSocketConnDetailsIdsMap[userId];
  }

  /**
   * Set user socket connection details table id.
   *
   * @param userId
   * @param userSocketConnDetailsId
   * @returns {boolean}
   */
  setIntoUserSocketIdsMap(userId, userSocketConnDetailsId) {
    const oThis = this;

    oThis.userSocketConnDetailsIdsMap[userId] = oThis.userSocketConnDetailsIdsMap[userId] || [];
    oThis.userSocketConnDetailsIdsMap[userId].push(userSocketConnDetailsId);

    return true;
  }

  /**
   * Delete from socket ids map.
   *
   * @param userId
   * @param userSocketConnDetailsId
   * @returns {boolean}
   */
  deleteFromUserSocketIdsMap(userId, userSocketConnDetailsId) {
    const oThis = this;

    const userSocketConnDetails = oThis.userSocketConnDetailsIdsMap[userId];
    if (!userSocketConnDetails) {
      return true;
    }

    const userSocketConnDetailsIdIndex = userSocketConnDetails.indexOf(userSocketConnDetailsId);
    if (userSocketConnDetailsIdIndex >= 0) {
      oThis.userSocketConnDetailsIdsMap[userId].splice(userSocketConnDetailsIdIndex, 1);
    }

    return true;
  }
  // END :: Operations on "userSocketConnDetailsIdsMap".

  // START :: Operations on "timeToUserSocketConnDetailsIdsMap".
  /**
   * Get time to socket ids map.
   *
   * @param timestamp
   * @returns {*|Array}
   */
  getTimeToSocketIds(timestamp) {
    const oThis = this;

    return oThis.timeToUserSocketConnDetailsIdsMap[timestamp] || [];
  }

  /**
   * Set time to socket ids map.
   *
   * @param timestamp
   * @param socketId
   * @returns {*}
   */
  setTimeToSocketIds(timestamp, socketId) {
    const oThis = this;
    oThis.timeToUserSocketConnDetailsIdsMap[timestamp] = oThis.timeToUserSocketConnDetailsIdsMap[timestamp] || [];
    oThis.timeToUserSocketConnDetailsIdsMap[timestamp].push(socketId);

    return oThis.timeToUserSocketConnDetailsIdsMap[timestamp];
  }

  /**
   * Delete from time to socket ids map.
   *
   * @param timestamp
   * @param socketId
   * @returns {boolean}
   */
  deleteTimeToSocketIds(timestamp, socketId) {
    const oThis = this;

    if (oThis.timeToUserSocketConnDetailsIdsMap[timestamp] && socketId) {
      const userSocketConnDetailsIdIndex = oThis.timeToUserSocketConnDetailsIdsMap[timestamp].indexOf(socketId);
      if (userSocketConnDetailsIdIndex >= 0) {
        oThis.timeToUserSocketConnDetailsIdsMap[timestamp].splice(userSocketConnDetailsIdIndex, 1);
      }
    } else {
      delete oThis.timeToUserSocketConnDetailsIdsMap[timestamp];
    }

    return true;
  }
  // END :: Operations on "timeToUserSocketConnDetailsIdsMap".

  /**
   * Check if socket connecting is stopped.
   *
   * @returns {boolean}
   */
  checkStopConnectingSockets() {
    const oThis = this;

    return oThis.stopConnectingSockets;
  }

  /**
   * Mark stopConnectingSockets true.
   *
   * @sets oThis.stopConnectingSockets
   *
   * @returns {boolean}
   */
  markStopConnectingSockets() {
    const oThis = this;

    oThis.stopConnectingSockets = true;

    return oThis.stopConnectingSockets;
  }
}

module.exports = new WebSocketCustomCache();
