/**
 * Class for web page constants.
 *
 * @class WebSocketMessage
 */
class WebSocketMessage {
  /**
   * Get socket publish stream.
   *
   * @param {number} testId
   * @param {string} postfix
   * @returns {string}
   */
  getSocketPublishStream(testId, postfix) {
    let stream = 'test.' + testId;

    if (postfix) {
      stream = stream + '.' + postfix;
    }

    return stream;
  }

  /**
   * Get string for socket connected kind.
   *
   * @returns {string}
   */
  get socketConnected() {
    return 'socket_connected';
  }
}

module.exports = new WebSocketMessage();
