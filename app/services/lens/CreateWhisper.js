const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  ImagesModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers');

/**
 * Class to create whisper.
 *
 * @class CreateWhisper
 */
class CreateWhisper extends ServiceBase {
  /**
   * Constructor to create whisper.
   *
   * @param {object} params
   * @param {object} params.current_user
   * @param {string} params.transaction_hash
   * @param {string} params.whisper_ipfs_object_id
   * @param {object} params.image_ipfs_object_id
   * @param {string} params.chain_id
   * @param {string} params.s3_url
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.transactionHash = params.transaction_hash;
    oThis.whisperIpfsObjectId = params.whisper_ipfs_object_id;
    oThis.imageIpfsObjectId = params.image_ipfs_object_id;
    oThis.chainId = params.chain_id;
    oThis.s3Url = params.s3_url;

    // todo: Please revert this change once the auth flow integrated @vaibhav
    // oThis.currentUser = params.current_user;
    oThis.currentUser = {
      id: 1
    };

    oThis.imageId = null;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis.createImage();

    await oThis.createWhisper();

    return oThis._prepareResponse();
  }

  /**
   * Create entry in image table
   *
   * @sets oThis.imageId
   */
  async createImage() {
    const oThis = this;

    const insertParams = {
      url: oThis.s3Url,
      ipfs_object_id: oThis.imageIpfsObjectId
    };

    const insertResponse = await new ImagesModel().insertRecord(insertParams);

    if (insertResponse.affectedRows !== 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_ci_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertParams: insertParams
          }
        })
      );
    }

    oThis.imageId = insertResponse.insertId;
  }

  /**
   * Create entry in whispers table
   *
   */
  async createWhisper() {
    const oThis = this;

    const insertParams = {
      user_id: oThis.currentUser.id,
      chain_id: oThis.chainId,
      image_id: oThis.imageId,
      platform: whispersConstants.lensPlatform,
      platform_id: oThis.transactionHash,
      ipfs_object_id: oThis.imageIpfsObjectId,
      status: whispersConstants.inactiveStatus
    };

    const insertResponse = await new WhispersModel().insertRecord(insertParams);

    if (insertResponse.insertId == null) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_ci_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertParams: insertParams
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

    return responseHelper.successWithData({});
  }
}

module.exports = CreateWhisper;
