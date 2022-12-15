const { ethers } = require('ethers');

const rootPrefix = '..',
  responseHelper = require(rootPrefix + '/lib/formatter/response');

// Sample message: "\nhttp://localhost:3000 wants you to sign in with your Ethereum account:\n0xE1ec35AE9ceb98d3b6DB6A4e0aa856BEA969B4DF\n\nSign in with ethereum to lens\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 80001\nNonce: 5cfe288b9b51df3a\nIssued At: 2022-12-15T05:20:08.295Z\n "
class VerifyLensSignerAddress {
  constructor(message, signature, address) {
    const oThis = this;

    oThis.message = message;
    oThis.signature = signature;
    oThis.address = address;
  }

  /**
   * Perform
   *
   * @returns {Promise<void>}
   */
  async perform() {
    const oThis = this;

    await oThis._verifyIssuedAt();

    await oThis._verifyAddress();
  }

  /**
   * Verify issued at
   *
   * @returns {Promise<never>}
   * @private
   */
  async _verifyIssuedAt() {
    const oThis = this;

    const issuedAtText = oThis.message.split('\n').at(-2);
    if (!issuedAtText) {
      return oThis._errorOut('Invalid challenge text');
    }

    let issuedAt;
    try {
      issuedAt = parseInt(new Date(issuedAtText.split(': ').at(-1)).getTime() / 1000);
    } catch (err) {
      return oThis._errorOut('Invalid challenge text');
    }

    const currentTs = parseInt(new Date().getTime() / 1000);

    if (currentTs - issuedAt > 5 * 600000) {
      // 5 mins
      return oThis._errorOut('Expired challenge text');
    }
  }

  /**
   * Verify address
   *
   * @returns {Promise<void>}
   * @private
   */
  async _verifyAddress() {
    const oThis = this;

    const recoveredAddress = ethers.utils.verifyMessage(oThis.message, oThis.signature).toLowerCase();
    if (recoveredAddress != oThis.address.toLowerCase()) {
      return oThis._errorOut('Invalid signature');
    }
  }

  /**
   * Error out
   *
   * @param err
   * @returns {Promise<never>}
   * @private
   */
  async _errorOut(err) {
    return Promise.reject(
      responseHelper.error({
        internal_error_identifier: 'l_vlsa',
        api_error_identifier: 'something_went_wrong',
        debug_options: { error: err }
      })
    );
  }
}

module.exports = VerifyLensSignerAddress;
