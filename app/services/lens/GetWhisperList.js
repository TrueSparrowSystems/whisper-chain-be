const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  ChainModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  UserModel = require(rootPrefix + '/app/models/mysql/main/User'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class to get whipser list of a chain.
 *
 * @class GetWhisperOfChain
 */
class GetWhisperOfChain extends ServiceBase {
  /**
   * Constructor to get Whispers of a chain.
   *
   * @param {object} params
   * @param {string} params.chain_id
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.chainId = params.chain_id;

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

    await oThis.createImagesMap();

    await oThis.createUserMap();

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
      const whispersModelResponse = await new WhispersModel().fetchByChainId(oThis.chainId);

      for (let index = 0; index < whispersModelResponse.length; index++) {
        const whisper = whispersModelResponse[index];
        oThis.whispersMap[whisper.id] = whisper;
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

      oThis.chainMap[oThis.chainId] = chainModelResponse[0];
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_gwl_ccm_1',
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
      [entityTypeConstants.whisperIds]: oThis.whisperIds,
      [entityTypeConstants.whispers]: oThis.whispersMap,
      [entityTypeConstants.chains]: oThis.chainMap,
      [entityTypeConstants.images]: oThis.imagesMap,
      [entityTypeConstants.users]: oThis.userMap
    });
  }
}

module.exports = GetWhisperOfChain;
