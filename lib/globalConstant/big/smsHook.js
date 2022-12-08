const rootPrefix = '../../..',
  util = require(rootPrefix + '/lib/util');

let _invertedStatuses, _invertedMessageKinds;

/**
 * Class for SMS hook constants.
 *
 * @class SmsHookConstant
 */
class SmsHookConstant {
  // Statuses start.
  get pendingStatus() {
    return 'PENDING';
  }

  get successStatus() {
    return 'SUCCESS';
  }

  get failedStatus() {
    return 'FAILED';
  }

  get ignoredStatus() {
    return 'IGNORED';
  }

  get verifiedOtpStatus() {
    return 'VERIFIED_OTP';
  }

  // Statuses end.

  /**
   * Enum values for statuses
   *
   * @returns {{'1': string, '2': string, '3': string, '4': string, '5': string}}
   */
  get statuses() {
    const oThis = this;

    return {
      '1': oThis.pendingStatus,
      '2': oThis.successStatus,
      '3': oThis.failedStatus,
      '4': oThis.ignoredStatus,
      '5': oThis.verifiedOtpStatus
    };
  }

  get invertedStatuses() {
    const oThis = this;

    _invertedStatuses = _invertedStatuses || util.invert(oThis.statuses);

    return _invertedStatuses;
  }

  // Message Kinds start.

  get sampleMessageKind() {
    return 'SAMPLE_MESSAGE_KIND';
  }

  // Message Kinds end.

  /**
   * Enum values for message kinds
   *
   * @returns {{'1': string}}
   */
  get messageKinds() {
    const oThis = this;

    return {
      '1': oThis.sampleMessageKind
    };
  }

  get invertedMessageKinds() {
    const oThis = this;

    _invertedMessageKinds = _invertedMessageKinds || util.invert(oThis.messageKinds);

    return _invertedMessageKinds;
  }

  get batchSizeForHooksProcessor() {
    return 10;
  }

  get retryLimitForFailedHooks() {
    return 1;
  }
}

module.exports = new SmsHookConstant();
