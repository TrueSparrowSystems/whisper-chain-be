const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let invertedStatuses, invertedEventKinds, invertedReceiverEntityKinds;

/**
 * Class for email service api call hook constants.
 *
 * @class EmailServiceApiCallHook
 */
class EmailServiceApiCallHook {
  // Status kinds start.

  /**
   * Get string value for pending status.
   *
   * @returns {string}
   */
  get pendingStatus() {
    return 'PENDING';
  }

  /**
   * Get string value for processed status.
   *
   * @returns {string}
   */
  get processedStatus() {
    return 'PROCESSED';
  }

  /**
   * Get string value for failed status.
   *
   * @returns {string}
   */
  get failedStatus() {
    return 'FAILED';
  }

  /**
   * Get string value for ignored status.
   *
   * @returns {string}
   */
  get ignoredStatus() {
    return 'IGNORED';
  }

  /**
   * Get string value for manually interrupted status.
   *
   * @returns {string}
   */
  get manuallyInterruptedStatus() {
    return 'MANUALLY_INTERRUPTED';
  }

  /**
   * Get string value for manually handled status.
   *
   * @returns {string}
   */
  get manuallyHandledStatus() {
    return 'MANUALLY_HANDLED';
  }

  // Status kinds end.

  get statuses() {
    const oThis = this;

    return {
      '1': oThis.pendingStatus,
      '2': oThis.processedStatus,
      '3': oThis.failedStatus,
      '4': oThis.ignoredStatus,
      '5': oThis.manuallyInterruptedStatus,
      '6': oThis.manuallyHandledStatus
    };
  }

  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }

  // Receiver entity kinds start.

  get testReceiverEmailEntityKind() {
    return 'TEST_RECEIVER_EMAIL';
  }

  // Receiver entity kinds end.

  get receiverEntityKinds() {
    const oThis = this;

    return {
      '1': oThis.testReceiverEmailEntityKind // NOTE: remove this later
    };
  }

  get invertedReceiverEntityKinds() {
    const oThis = this;

    invertedReceiverEntityKinds = invertedReceiverEntityKinds || util.invert(oThis.receiverEntityKinds);

    return invertedReceiverEntityKinds;
  }

  // Event types start.

  /**
   * Get string value for add contact event type.
   *
   * @returns {string}
   */
  get addContactEventType() {
    return 'ADD_CONTACT';
  }

  /**
   * Get string value for update contact attribute event type.
   *
   * @returns {string}
   */
  get updateContactAttributeEventType() {
    return 'UPDATE_CONTACT_ATTRIBUTE';
  }

  /**
   * Get string value for send transactional event type.
   *
   * @returns {string}
   */
  get sendTransactionalEmailEventType() {
    return 'SEND_TRANSACTIONAL_MAIL';
  }

  /**
   * Get string value for remove contact event type.
   *
   * @returns {string}
   */
  get removeContactEventType() {
    return 'REMOVE_CONTACT';
  }

  /**
   * Get string value for change contact event type.
   *
   * @returns {string}
   */
  get changeContactStatusEventType() {
    return 'CHANGE_CONTACT_STATUS';
  }

  // Event types end.

  get eventKinds() {
    const oThis = this;

    return {
      '1': oThis.sendTransactionalEmailEventType,
      '2': oThis.addContactEventType,
      '3': oThis.updateContactAttributeEventType,
      '4': oThis.removeContactEventType,
      '5': oThis.changeContactStatusEventType
    };
  }

  get invertedEventKinds() {
    const oThis = this;

    invertedEventKinds = invertedEventKinds || util.invert(oThis.eventKinds);

    return invertedEventKinds;
  }

  // Custom attributes end.

  /**
   * This function is used to validate custom attributes.
   *
   * @returns {{}}
   */
  get supportedCustomAttributesMap() {
    return {};
  }

  /**
   * Get the batch size for hooks processor.
   *
   * @returns {number}
   */
  get batchSizeForHooksProcessor() {
    return 10;
  }

  /**
   * Get retry limit count for failed hooks.
   *
   * @returns {number}
   */
  get retryLimitForFailedHooks() {
    return 3;
  }

  /**
   * Get pepo campaigns base kind.
   *
   * @returns {string}
   */
  get pepoCampaignBaseKind() {
    return 'BASE';
  }

  /**
   * Get pepo Campaign Account kind
   *
   * @returns {string}
   */
  pepoCampaignAccountKind() {
    const oThis = this;

    return oThis.pepoCampaignBaseKind;
  }
}

module.exports = new EmailServiceApiCallHook();
