const rootPrefix = '../../..',
  EmailServiceAPICallHookModel = require(rootPrefix + '/app/models/mysql/big/EmailServiceAPICallHook'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Base class for hook creator.
 *
 * @class HookCreatorBase
 */
class HookCreatorBase {
  /**
   * Constructor for hook creator base.
   *
   * @param {object} params
   * @param {number} params.receiverEntityId: Receiver entity id that would go into hooks table
   * @param {string} params.receiverEntityKind: Receiver entity kind
   * @param {string} [params.customDescription]: Description which would be logged in email service hooks table
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.receiverEntityId = params.receiverEntityId;
    oThis.receiverEntityKind = params.receiverEntityKind;
    oThis.customDescription = params.customDescription;
  }

  /**
   * Main performer method.
   *
   * @returns {Promise<void>}
   */
  async perform() {
    const oThis = this;

    await oThis._validate();

    await oThis._createHook({});
  }

  /**
   * Validate common params.
   *
   * @returns {Promise<never>}
   * @private
   */
  _validate() {
    const oThis = this;

    if (!emailServiceApiCallHookConstants.invertedReceiverEntityKinds[oThis.receiverEntityKind]) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_e_hc_b_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: { receiverEntityKind: oThis.receiverEntityKind }
        })
      );
    }
  }

  /**
   * Get an event type.
   *
   * @private
   */
  get _eventType() {
    throw new Error('Sub-class to implement _eventType.');
  }

  /**
   * Create hook in email service api call hooks table.
   *
   * @param {object} params
   *
   * @returns {Promise<void>}
   * @private
   */
  async _createHook(params) {
    const oThis = this;

    await new EmailServiceAPICallHookModel()
      .insert({
        receiver_entity_id: oThis.receiverEntityId,
        receiver_entity_kind: emailServiceApiCallHookConstants.invertedReceiverEntityKinds[oThis.receiverEntityKind],
        event_type: emailServiceApiCallHookConstants.invertedEventKinds[oThis._eventType],
        execution_timestamp: params.executionTimestamp || basicHelper.getCurrentTimestampInSeconds(),
        custom_description: oThis.customDescription,
        params: JSON.stringify(params)
      })
      .fire();
  }
}

module.exports = HookCreatorBase;
