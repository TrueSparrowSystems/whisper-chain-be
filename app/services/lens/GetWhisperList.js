const { totalWhispers } = require('../../../lib/globalConstant/chains');

const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  ChainModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  UserModel = require(rootPrefix + '/app/models/mysql/main/User'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  chainConstants = require(rootPrefix + '/lib/globalConstant/chains'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class to get whispers list of a chain.
 *
 * @class GetWhisperOfChain
 */
class GetWhisperOfChain extends ServiceBase {
  /**
   * Constructor to get Whispers of a chain.
   *
   * @param {object} params
   * @param {number} params.chain_id
   * @param {number} params.page
   * @param {number} params.limit
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.chainId = params.chain_id;
    oThis.page = params.page;
    oThis.limit = params.limit;

    oThis.whispersMap = {};
    oThis.whisperIds = [];
    oThis.chainIds = [];
    oThis.chainMap = {};
    oThis.userIds = [];
    oThis.userMap = {};
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

    await oThis.createWhispersMap();

    await oThis.createChainMap();

    await oThis.createUserMap();

    await oThis.createImagesMap();

    return oThis._prepareResponse();
  }

  /**
   * Populate whisper map.
   *
   * @returns {*|result}
   */
  async createWhispersMap() {
    const oThis = this;
    try {
      const whispersModelResponse = await new WhispersModel().getWhispersDataWithPagination(
        oThis.page,
        oThis.limit,
        oThis.chainId
      );

      for (let index = 0; index < whispersModelResponse.length; index++) {
        const whisper = whispersModelResponse[index];

        const whisperObject = {
          id: whisper.id,
          imageId: whisper.imageId,
          userId: whisper.userId,
          ipfsObjectId: whisper.ipfsObjectId,
          uts: whisper.updatedAt,
          platformChainId: whisper.platformId,
          platformChainUrl: whisper.platformUrl,
          chainId: oThis.chainId,
          platform: platformConstants.platforms[whisper.platform],
          status: whispersConstants.statuses[whisper.status]
        };
        oThis.whispersMap[whisper.id] = whisperObject;
        oThis.whisperIds.push(whisper.id);
        oThis.imageIds.push(whisper.imageId);
        oThis.userIds.push(whisper.userId);
      }
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_gwl_cwm_1',
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
   * Populate chain map.
   *
   * @returns {*|result}
   */
  async createChainMap() {
    const oThis = this;
    try {
      const chainModelResponse = await new ChainModel().getById(oThis.chainId);

      const chainObject = {
        id: chainModelResponse[0].id,
        imageId: chainModelResponse[0].imageId,
        recentWhisperIds: [],
        userId: chainModelResponse[0].userId,
        ipfsObjectId: chainModelResponse[0].ipfsObjectId,
        uts: chainModelResponse[0].updatedAt,
        startTs: chainModelResponse[0].createdAt,
        platformChainId: chainModelResponse[0].platformId,
        platformChainUrl: chainModelResponse[0].platformUrl,
        platform: platformConstants.platforms[chainModelResponse[0].platform],
        status: chainConstants.statuses[chainModelResponse[0].status],
        // TODO total_whispers getTotalWhisperById not needed.
        totalWhispers: chainModelResponse[0].totalWhispers
      };

      oThis.userIds.push(chainModelResponse[0].userId);
      oThis.imageIds.push(chainModelResponse[0].imageId);
      oThis.chainMap[oThis.chainId] = chainObject;
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_gwl_ccm_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            chainId: oThis.chainId,
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
      const imagesModelResponse = await new ImageModel().getByIds(oThis.imageIds);

      for (let index = 0; index < oThis.imageIds.length; index++) {
        const imageObject = {
          id: imagesModelResponse[oThis.imageIds[index]].id,
          url: imagesModelResponse[oThis.imageIds[index]].url,
          uts: imagesModelResponse[oThis.imageIds[index]].updatedAt
        };
        oThis.imagesMap[oThis.imageIds[index]] = imageObject;
      }
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

      for (let index = 0; index < oThis.userIds.length; index++) {
        oThis.userMap[oThis.userIds[index]].uts = oThis.userMap[oThis.userIds[index]].updatedAt;

        if (oThis.userMap[oThis.userIds[index]].platformProfileImageId) {
          oThis.imageIds.push(oThis.userMap[oThis.userIds[index]].platformProfileImageId);
        }
      }
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
      [entityTypeConstants.whisperIds]: oThis.whisperIds,
      [entityTypeConstants.whispers]: oThis.whispersMap,
      [entityTypeConstants.chains]: oThis.chainMap,
      [entityTypeConstants.images]: oThis.imagesMap,
      [entityTypeConstants.users]: oThis.userMap
    });
  }
}

module.exports = GetWhisperOfChain;
