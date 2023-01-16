const rootPrefix = '../../..';
const ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');
/**
 * Class to logout user.
 *
 * @class Logout
 */
class Logout extends ServiceBase {
  async _asyncPerform() {
    const oThis = this;

    return oThis._prepareResponse();
  }

  /**
   * Prepare response.
   *
   * @returns {Promise<*|result>}
   * @private
   */
  async _prepareResponse() {
    return responseHelper.successWithData({});
  }
}

module.exports = Logout;
