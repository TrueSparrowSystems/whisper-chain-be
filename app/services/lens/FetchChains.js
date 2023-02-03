const { totalWhispers } = require('../../../lib/globalConstant/chains');

const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  ChainsModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  UserModel = require(rootPrefix + '/app/models/mysql/main/User'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform'),
  chainConstants = require(rootPrefix + '/lib/globalConstant/chains'),
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
   * @param {number} params.limit
   * @param {string} params.platform
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.page = params.page;
    oThis.limit = params.limit;
    oThis.platform = params.platform;

    oThis.chainIds = [];
    oThis.chainsMap = {};

    oThis.whispersMap = {};

    oThis.userIds = [];
    oThis.usersMap = {};

    oThis.imageIds = [];
    oThis.imagesMap = {};
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

    await oThis.createUserMap();

    await oThis.createImagesMap();

    return oThis._prepareResponse();
  }

  async fetchChainsData() {
    const oThis = this;
    try {
      const chainsArray = await new ChainsModel().getActiveChainsDataWithPagination(
        oThis.page,
        oThis.limit,
        oThis.platform
      );

      chainsArray.forEach((chain) => {
        const chainObject = {
          id: chain.id,
          uts: chain.updatedAt,
          ipfsObjectId: chain.ipfsObjectId,
          recentWhisperIds: [],
          startTs: chain.createdAt,
          imageId: chain.imageId,
          userId: chain.userId,
          platform: platformConstants.platforms[chain.platform],
          platformChainId: chain.platformId,
          platformChainUrl: chain.platformUrl,
          status: chainConstants.statuses[chain.status],
          // TODO total_whispers - getTotalWhisperById not needed.
          totalWhispers: chain.totalWhispers
        };
        oThis.chainsMap[chain.id] = chainObject;
        oThis.chainIds.push(chain.id);
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
      if (oThis.chainIds.length > 0) {
        for (const index in oThis.chainIds) {
          const chainId = oThis.chainIds[index];
          const whispersArray = await new WhispersModel().getWhisperByChainIdWithLimit(chainId, 3);
          const whisperIds = [];
          whispersArray.forEach((whisper) => {
            const whisperObject = {
              id: whisper.id,
              imageId: whisper.imageId,
              userId: whisper.userId,
              ipfsObjectId: whisper.ipfsObjectId,
              uts: whisper.updatedAt,
              platformChainId: whisper.platformId,
              platformChainUrl: whisper.platformUrl,
              chainId: chainId,
              platform: platformConstants.platforms[whisper.platform],
              status: whispersConstants.statuses[whisper.status]
            };

            whisperIds.push(whisper.id);
            oThis.whispersMap[whisper.id] = whisperObject;
            oThis.userIds.push(whisper.userId);
            oThis.imageIds.push(whisper.imageId);
          });

          oThis.chainsMap[chainId].recentWhisperIds = whisperIds;
        }
      }
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_fc_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            chainIds: oThis.chainIds,
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
      if (oThis.imageIds.length > 0) {
        const imagesMap = await new ImageModel().getByIds(oThis.imageIds);
        for (let index = 0; index < oThis.imageIds.length; index++) {
          const imageObject = {
            id: imagesMap[oThis.imageIds[index]].id,
            url: imagesMap[oThis.imageIds[index]].url,
            uts: imagesMap[oThis.imageIds[index]].updatedAt
          };
          oThis.imagesMap[oThis.imageIds[index]] = imageObject;
        }
      }
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_fc_cim_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            imageIds: oThis.imageIds,
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
      if (oThis.userIds.length > 0) {
        oThis.userMap = await new UserModel().getByIds(oThis.userIds);

        for (let index = 0; index < oThis.userIds.length; index++) {
          oThis.userMap[oThis.userIds[index]].uts = oThis.userMap[oThis.userIds[index]].updatedAt;

          if (oThis.userMap[oThis.userIds[index]].platformProfileImageId) {
            oThis.imageIds.push(oThis.userMap[oThis.userIds[index]].platformProfileImageId);
          }
        }
      }
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_fc_cum_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            userIds: oThis.userIds,
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
      [entityTypeConstants.chains]: oThis.chainsMap,
      [entityTypeConstants.whispers]: oThis.whispersMap,
      [entityTypeConstants.images]: oThis.imagesMap,
      [entityTypeConstants.users]: oThis.userMap
    });
  }
}

module.exports = FetchChains;
