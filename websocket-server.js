const app = require('express')();
const http = require('http').createServer(app);

const rootPrefix = '.',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  configStrategyProvider = require(rootPrefix + '/lib/providers/configStrategy'),
  configStrategyConstants = require(rootPrefix + '/lib/globalConstant/config/configStrategy');

const socketConnParams = {
  allowEIO3: true, // Enable compatibility mode
  pingInterval: 30000, // How many ms before sending a new ping packet [30 seconds]
  pingTimeout: 60000 // How many ms without a pong packet to consider the connection closed [60 seconds]
};

if (basicHelper.isDevelopment()) {
  socketConnParams.cors = { origin: '*' };
}
const io = require('socket.io')(http, socketConnParams);

// Web-socket related requires.
const SocketJobProcessor = require(rootPrefix + '/executables/rabbitMqSubscribers/SocketJobProcessor'),
  WebsocketAuth = require(rootPrefix + '/app/services/websocket/Auth'),
  processIdSelector = require(rootPrefix + '/lib/webSocket/processIdSelector'),
  webSocketServerHelper = require(rootPrefix + '/lib/webSocket/helper'),
  webSocketCustomCache = require(rootPrefix + '/lib/webSocket/customCache'),
  websocketAutoDisconnect = require(rootPrefix + '/lib/webSocket/autoDisconnect'),
  socketConnectionConstants = require(rootPrefix + '/lib/globalConstant/socket/socketConnection');

const apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  errorConfig = basicHelper.fetchErrorConfig(apiVersions.v1);

let socketIdentifier = null;

/**
 * Start subscription job for cron process id.
 *
 * @param {number} cronProcessId
 *
 * @returns {Promise<void>}
 */
async function subscribeToRmq(cronProcessId) {
  const socketJobProcessorObj = new SocketJobProcessor({ cronProcessId: +cronProcessId });
  await socketJobProcessorObj.perform();
  socketIdentifier = socketConnectionConstants.getSocketIdentifierFromTopic(socketJobProcessorObj.topics[0]);
}

/**
 * Attach handlers.
 */
function attachHandlers() {
  io.on('connection', async function(socket) {
    logger.debug('New user connected socket=====>', socket.handshake.query);
    let err = null;

    if (webSocketCustomCache.checkStopConnectingSockets()) {
      err = responseHelper.error({
        internal_error_identifier: 'ws_s_3',
        api_error_identifier: 'websocket_service_unavailable',
        debug_options: {}
      });
      socket.emit('chat-stream', JSON.stringify(err));
      socket.disconnect();

      return true;
    }

    const params = socket.handshake.query;
    params.socketIdentifier = socketIdentifier;

    const websocketAuthRsp = await new WebsocketAuth(params).perform().catch(function(error) {
      return responseHelper.error({
        internal_error_identifier: 'ws_s_1',
        api_error_identifier: 'something_went_wrong',
        debug_options: { error: error }
      });
    });

    await webSocketServerHelper.associateEvents(socket);

    if (websocketAuthRsp.isFailure()) {
      err = responseHelper.error({
        internal_error_identifier: 'ws_s_2',
        api_error_identifier: 'unauthorized_api_request',
        debug_options: { websocketAuthRsp: websocketAuthRsp.internalErrorCode }
      });
      socket.emit('chat-stream', JSON.stringify(err));
      socket.disconnect();

      return true;
    }

    await webSocketServerHelper.onSocketConnection(
      websocketAuthRsp.data.userId,
      websocketAuthRsp.data.userSocketConnDetailsId,
      websocketAuthRsp.data.apiVersion,
      socket
    );
  });
}

/**
 * Function to run socket server.
 *
 * @returns {Promise<void>}
 */
async function run() {
  const websocketConfigResponse = await configStrategyProvider.getConfigForKind(configStrategyConstants.websocket);

  if (websocketConfigResponse.isFailure()) {
    return websocketConfigResponse;
  }

  const websocketPort = websocketConfigResponse.data[configStrategyConstants.websocket].port;

  logger.step('# Fetching cron process id.');
  const cronProcessId = await processIdSelector.perform();

  logger.step('# Start subscription job for cron process id:', cronProcessId);
  await subscribeToRmq(cronProcessId);

  logger.step('# Attaching handlers');
  attachHandlers();

  //* * Uncomment the following lines to test websockets on local. **/
  // app.get('/', function(req, res) {
  //   res.sendFile(__dirname + '/index.html');
  // });

  http.listen(websocketPort, function() {
    logger.step('# Listening on port ' + websocketPort);
  });
}

/**
 * Function to disconnect.
 *
 * @returns {Promise<void>}
 */
async function autoDisconnect() {
  logger.log('# Auto Disconnect called at: ', basicHelper.getCurrentTimestampInMinutes());
  websocketAutoDisconnect.perform();
  setTimeout(autoDisconnect, 60 * 1000);
}

run().catch(async function(err) {
  logger.error('Could not start websocket-server: ', err);

  const errorObject = responseHelper.error({
    internal_error_identifier: 'Could not start websocket-server',
    api_error_identifier: 'something_went_wrong',
    debug_options: { error: err.toString(), stack: err.stack },
    error_config: errorConfig
  });

  await createErrorLogsEntry.perform(errorObject, errorLogsConstants.highSeverity);

  process.exit(1);
});

autoDisconnect();
