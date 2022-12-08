const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let invertedStatuses;

/**
 * Class for for user socket connection details constants.
 *
 * @class SocketConnection
 */
class SocketConnection {
  // Statuses start.

  /**
   * Get string value for created status.
   *
   * @returns {string}
   */
  get createdStatus() {
    return 'CREATED';
  }

  /**
   * Get string value for connected status
   *
   * @returns {string}
   */
  get connectedStatus() {
    return 'CONNECTED';
  }

  /**
   * Get string value for expired status.
   *
   * @returns {string}
   */
  get expiredStatus() {
    return 'EXPIRED';
  }
  // Statuses end.

  /**
   * Get status by enum.
   *
   * @returns {object}
   */
  get statuses() {
    const oThis = this;

    return {
      '1': oThis.createdStatus,
      '2': oThis.connectedStatus,
      '3': oThis.expiredStatus
    };
  }

  /**
   * Get enum from status.
   *
   * @returns {object}
   */
  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }

  /**
   * Get socket RMQ topic name.
   *
   * @param {string} socketIdentifier
   *
   * @returns {string}
   */
  getSocketRmqTopic(socketIdentifier) {
    return 'socket.' + socketIdentifier;
  }

  /**
   * Get socket identifier from topic.
   *
   * @param {string} topic
   *
   * @returns {string}
   */
  getSocketIdentifierFromTopic(topic) {
    const topicElements = topic.split('.');

    return topicElements[topicElements.length - 1];
  }
}

module.exports = new SocketConnection();
