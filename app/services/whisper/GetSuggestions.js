const rootPrefix = '../../../',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  GenerateAndUploadImages = require(rootPrefix + '/lib/stabilityAi/GenerateAndUploadImages');
entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class to get suggestions.
 *
 * @class GetSuggestions
 */
class GetSuggestions extends ServiceBase {
  /**
   * Constructor to get suggestions.
   *
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} params.art_style
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.prompt = params.prompt;
    oThis.artStyle = params.art_style;

    oThis.s3Urls = null;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    oThis.s3Urls = await new GenerateAndUploadImages({
      prompt: oThis.prompt,
      artStyle: oThis.artStyle || null
    }).perform();

    return oThis._prepareResponse();
  }

  /**
   * Prepare service response.
   *
   * @returns {*|result}
   * @private
   */
  _prepareResponse() {
    const oThis = this;

    return responseHelper.successWithData({
      s3_urls: oThis.s3Urls
    });
  }
}

module.exports = GetSuggestions;
