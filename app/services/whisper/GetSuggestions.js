const rootPrefix = '../../../',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  GenerateAndUploadImages = require(rootPrefix + '/lib/stabilityAi/GenerateAndUploadImages'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

const { v4: uuidV4 } = require('uuid');

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

    oThis.suggestionsMap = {};
    oThis.suggestionIds = [];
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  // TODO: break this into smaller functions
  async _asyncPerform() {
    const oThis = this;

    oThis.s3Urls = await new GenerateAndUploadImages({
      prompt: oThis.prompt,
      artStyle: oThis.artStyle || null
    }).perform();

    for (let index = 0; index < oThis.s3Urls.length; index++) {
      const s3Url = oThis.s3Urls[index];
      const uid = uuidV4();
      const ts = Date.now();
      oThis.suggestionIds.push(uid);
      oThis.suggestionsMap[uid] = {
        id: uid,
        uts: ts,
        imageUrl: s3Url
      };
    }

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
      [entityTypeConstants.suggestionsIds]: oThis.suggestionIds,
      [entityTypeConstants.suggestions]: oThis.suggestionsMap
    });
  }
}

module.exports = GetSuggestions;
