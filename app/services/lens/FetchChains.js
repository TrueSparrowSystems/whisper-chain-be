const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  ChainsModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  UserModel = require(rootPrefix + '/app/models/mysql/main/User'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class to fetch chains.
 *
 * @class GetSuggestions
 */
class FetchChains extends ServiceBase {
  /**
   * Constructor to fetch chains.
   *
   * @param {object} params
   * @param {number} params.page
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.page = params.page;
    oThis.limit = params.limit;
    oThis.platform = params.platform;

    oThis.chainIds = null;
    oThis.chainsMap = {};

    oThis.whispersMap = {};

    oThis.userIds = [];
    oThis.usersMap = {};

    oThis.imageIds = [];
    oThis.imagesMap = {};

    oThis.chainIdToWhisperIds = {};
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis.fetchChainsData();

    await oThis.fetchLastThreeWhispers();

    await oThis.createImagesMap();

    await oThis.createUserMap();

    return oThis._prepareResponse();
  }

  async fetchChainsData() {
    const oThis = this;
    try {
      console.log('* Fetching chains data from DB');
      const chainsMap = await new ChainsModel().getActiveChainsDataWithPagination(
        oThis.page,
        oThis.limit,
        oThis.platform
      );
      oThis.chainsMap = chainsMap;
      oThis.chainIds = Object.keys(oThis.chainsMap);

      chainsMap.forEach((chain) => {
        oThis.userIds.push(chain.userId);
        oThis.imageIds.push(chain.imageId);
      });
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_fc_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            s3Url: oThis.page,
            error: error
          }
        })
      );
    }
  }

  async fetchLastThreeWhispers() {
    const oThis = this;
    try {
      console.log('* Fetching whispers data from DB');
      oThis.chainIds.forEach(async (chainId) => {
        const whispersArray = await new WhispersModel().getWhisperByChainIdWithLimit(chainId, 3);
        const whisperIds = [];
        whispersArray.forEach((whisper) => {
          whisperIds.push(whisper.id);
          oThis.whispersMap[whisper.id] = whisper;
          oThis.userIds.push(whisper.userId);
          oThis.imageIds.push(whisper.imageId);
        });
        oThis.chainIdToWhisperIds[chainId] = whisperIds;
      });
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_fc_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            s3Url: oThis.page,
            error: error
          }
        })
      );
    }
  }

  /**
   * Populate Image map.
   *
   * @returns {*|result}
   */
  async createImagesMap() {
    const oThis = this;
    try {
      oThis.imagesMap = await new ImageModel().getByIds(oThis.imageIds);
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_gwl_cim_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            s3Url: oThis.s3Url,
            error: error
          }
        })
      );
    }
  }

  /**
   * Populate User map.
   *
   * @returns {*|result}
   */
  async createUserMap() {
    const oThis = this;
    try {
      oThis.userMap = await new UserModel().getByIds(oThis.userIds);
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_gwl_cum_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            s3Url: oThis.s3Url,
            error: error
          }
        })
      );
    }
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
      [entityTypeConstants.chainIds]: oThis.chainIds,
      [entityTypeConstants.chains]: oThis.chainMap,
      [entityTypeConstants.whispers]: oThis.whispersMap,
      [entityTypeConstants.images]: oThis.imagesMap,
      [entityTypeConstants.users]: oThis.userMap,
      [entityTypeConstants.chainIdToWhisperIds]: oThis.chainIdToWhisperIds
    });
  }
}

module.exports = FetchChains;
