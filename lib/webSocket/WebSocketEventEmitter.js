const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  webSocketCustomCache = require(rootPrefix + '/lib/webSocket/customCache'),
  webSocketMessageConstants = require(rootPrefix + '/lib/globalConstant/webSocketMessage'),
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

/**
 * Class for web-socket event emitter.
 *
 * @class WebSocketEventEmitter
 */
class WebSocketEventEmitter {
  /**
   * Constructor for web-socket event emitter.
   *
   * @param {object} params
   * @param {array<number>} params.userIds
   * @param {object} params.messagePayload
   * @param {string} params.messagePayload.kind
   * @param {number} params.messagePayload.eventMeetingId
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    logger.step('socket params: ', params);
    oThis.userIds = params.userIds;
    oThis.messagePayload = params.messagePayload;

    oThis.messageKind = oThis.messagePayload.kind;

    oThis.socketPublishStream = null;
    oThis.userSpecific = null;
    oThis.serviceResponsePayload = {};

    oThis.finalSocketPayloads = {};
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<*>}
   */
  perform() {
    const oThis = this;

    return oThis._asyncPerform().catch(async function(err) {
      let errorObject = err;

      if (!responseHelper.isCustomResult(err)) {
        errorObject = responseHelper.error({
          internal_error_identifier: 'l_ws_wse_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { error: err.toString(), stack: err.stack }
        });

        await createErrorLogsEntry.perform(errorObject, errorLogsConstants.mediumSeverity);
        logger.error(' In catch block of lib/webSocket/WebSocketEventEmitter.js Error is: ', err);
      }
      logger.error(' Stringified error:: ', JSON.stringify(errorObject.getDebugData()));

      return errorObject;
    });
  }

  /**
   * Main performer class.
   *
   * @returns {Promise<void>}
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis._fetchAndValidateServiceResponse();

    await oThis._formatSocketPayload();

    await oThis._sendPayloadOverSocket();
  }

  /**
   * Validate response.
   *
   * @sets oThis.socketPublishStream, oThis.userSpecific, oThis.dontSendUserIds, oThis.serviceResponsePayload
   *
   * @returns {Promise<never>}
   * @private
   */
  async _fetchAndValidateServiceResponse() {
    const oThis = this;

    const socketServiceResponse = await new oThis._getSocketPayloadInstance({
      userIds: oThis.userIds,
      messagePayload: oThis.messagePayload
    }).perform();

    if (socketServiceResponse.isFailure()) {
      return Promise.reject(socketServiceResponse);
    }

    oThis.socketPublishStream = socketServiceResponse.data.socketPublishStream;
    oThis.userSpecific = socketServiceResponse.data.userSpecific;
    oThis.dontSendUserIds = socketServiceResponse.data.dontSendUserIds || [];
    oThis.serviceResponsePayload = socketServiceResponse.data.responsePayload;

    if (!oThis.socketPublishStream || CommonValidators.isVarNullOrUndefined(oThis.userSpecific)) {
      logger.error('socketPublishStream and userSpecific attributes are mandatory in response.');

      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_ws_wse_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: { socketPayloads: socketServiceResponse }
        })
      );
    }
  }

  /**
   * Get socket payload.
   *
   * @returns {Promise<*>}
   */
  get _getSocketPayloadInstance() {
    const oThis = this;
    logger.info('WebSocket Event Emitter called for=====>', oThis.messageKind);

    switch (oThis.messageKind) {
      case 'sample_message_kind':
      // return payloadForSampleMessage();
      default:
        throw new Error('invalid messageKind', oThis.messageKind);
    }
  }

  /**
   * Format socket payload
   *
   * @returns {Promise<void>}
   */
  async _formatSocketPayload() {
    const oThis = this;

    for (let index = 0; index < oThis.userIds.length; index++) {
      const userId = oThis.userIds[index];
      let userServiceData = null;
      if (oThis.userSpecific) {
        userServiceData = oThis.serviceResponsePayload[userId];
      } else {
        userServiceData = oThis.serviceResponsePayload;
      }
      if (!userServiceData) {
        continue;
      }
      await oThis._getFormattedFinalPayload(userId, userServiceData);
    }
  }

  /**
   * Get final formatted payload.
   *
   * @sets: oThis.finalSocketPayloads
   *
   * @param userId
   * @param userServiceData
   * @returns {Promise<void>}
   * @private
   */
  async _getFormattedFinalPayload(userId, userServiceData) {
    const oThis = this;

    oThis.finalSocketPayloads[userId] = {};
    const socketObjectIds = webSocketCustomCache.getFromUserSocketConnDetailsIdsMap(userId) || [];

    for (let ind = 0; ind < socketObjectIds.length; ind++) {
      const socketId = socketObjectIds[ind];
      const socketObj = webSocketCustomCache.getFromSocketIdToSocketObjMap(socketId);

      if (!socketObj) {
        continue;
      }
      const entityKindToResponseKeyMap = await oThis._getEntityKindToResponseKeyMap(socketObj.apiVersion);

      const formatterComposerParams = {
        entityKindToResponseKeyMap: entityKindToResponseKeyMap
      };

      formatterComposerParams.serviceData = userServiceData;

      const FormatterComposer = FormatterComposerFactory.getComposer(socketObj.apiVersion);
      const wrapperFormatterRsp = await new FormatterComposer(formatterComposerParams).perform();
      const formattedSocketPayload = wrapperFormatterRsp.data;

      oThis.finalSocketPayloads[userId][socketId] = {
        kind: oThis.messageKind,
        payload: formattedSocketPayload
      };
    }
  }

  /**
   * Send payload over socket.
   *
   * @returns {Promise<void>}
   */
  async _sendPayloadOverSocket() {
    const oThis = this;

    logger.debug('oThis.userIds---------', JSON.stringify(oThis.userIds));
    logger.debug('finalSocketPayloads---------', JSON.stringify(oThis.finalSocketPayloads));

    for (let index = 0; index < oThis.userIds.length; index++) {
      const userId = oThis.userIds[index];
      const socketIdPayloadMap = oThis.finalSocketPayloads[userId];

      for (const socketId in socketIdPayloadMap) {
        const socketObj = webSocketCustomCache.getFromSocketIdToSocketObjMap(socketId);
        const finalUserSocketPayload = socketIdPayloadMap[socketId];

        if (!socketObj || !finalUserSocketPayload || oThis.dontSendUserIds.indexOf(userId) >= 0) {
          continue;
        }

        socketObj.emit(oThis.socketPublishStream, JSON.stringify(finalUserSocketPayload));
      }
    }
  }

  /**
   * Get entity kind to response key map.
   *
   * @returns {Promise<void>}
   * @private
   */
  // eslint-disable-next-line max-lines-per-function
  async _getEntityKindToResponseKeyMap(apiVersion) {
    const oThis = this;

    switch (oThis.messageKind) {
      case 'sample_message':
      // return { entityKind: responseEntityKey };
      default: {
        throw new Error('invalid messageKind', oThis.messageKind);
      }
    }
  }
}

module.exports = WebSocketEventEmitter;
