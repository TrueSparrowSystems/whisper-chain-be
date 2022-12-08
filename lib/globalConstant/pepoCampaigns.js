/**
 * Class for pepo campaigns constants.
 *
 * @class PepoCampaigns
 */
class PepoCampaigns {
  get pepoCampaignsAPIVersion() {
    return 'v2';
  }

  get requestTimeout() {
    return 5000;
  }

  get doubleOptInStatusUserSetting() {
    return 'double_opt_in_status';
  }

  get subscribeStatusUserSetting() {
    return 'subscribe_status';
  }

  get pendingValue() {
    return 'pending';
  }

  get verifiedValue() {
    return 'verified';
  }

  get subscribedValue() {
    return 'subscribed';
  }

  get unsubscribedValue() {
    return 'unsubscribed';
  }

  // Pepo Campaign Change Contact status kinds start.
  get unsubscribeStatus() {
    return 'unsubscribe';
  }

  get subscribeStatus() {
    return 'resubscribe';
  }

  // This function is used to validate change contact status attributes.
  get supportedContactStatusKinds() {
    const oThis = this;

    return {
      [oThis.unsubscribeStatus]: 1,
      [oThis.subscribeStatus]: 1
    };
  }
  // Pepo Campaign Contact status kinds start.
}

module.exports = new PepoCampaigns();
