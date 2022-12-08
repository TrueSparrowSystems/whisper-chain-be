const rootPrefix = '../../..',
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

/**
 * Base class for hook processor.
 *
 * @class HookProcessorBase
 */
class HookProcessorBase {
  /**
   * Constructor class for hook processor.
   *
   * @param {object} params
   * @param {object} params.hook: db record(hook) of EmailServiceApiCallHook table
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.hook = params.hook;

    oThis.sendMailParams = {};
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<void>}
   */
  async perform() {
    const oThis = this;

    await oThis._validate();

    return oThis._processHook();
  }

  /**
   * Get email ID.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _getEmail() {
    const oThis = this;

    switch (emailServiceApiCallHookConstants.receiverEntityKinds[oThis.hook.receiverEntityKind]) {
      case 'test':
        return responseHelper.successWithData({ emailDetails: {}, user: {} }); // Do nothing, case for testing - remove later
      default: {
        throw new Error(`Invalid receiverEntityKind-${oThis.hook.receiverEntityKind} for id-${oThis.hook.id} `);
      }
    }
  }

  /**
   * Validate.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validate() {
    throw new Error('Sub-class to implement _validate');
  }

  /**
   * Process hook.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _processHook() {
    throw new Error('Sub-class to implement _processHook');
  }
}

module.exports = HookProcessorBase;
