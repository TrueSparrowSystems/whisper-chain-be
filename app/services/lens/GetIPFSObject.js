const rootPrefix = '../../..',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  FileIo = require(rootPrefix + '/lib/fileIo/FileIo'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  IpfsObjectsModel = require(rootPrefix + '/app/models/mysql/main/IpfsObject'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  ipfsObjectConstant = require(rootPrefix + '/lib/globalConstant/ipfsObject'),
  Ipfs = require(rootPrefix + '/lib/Ipfs/Ipfs');

const fs = require('fs');
/**
 * Class to get suggestions.
 *
 * @class GetSuggestions
 */
class GetIPFSMetada extends ServiceBase {
  /**
   * Constructor to get suggestions.
   *
   * @param {object} params
   * @param {string} params.s3_url
   * @param {string} params.description
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.s3Url = params.s3_url;
    oThis.description = params.description;

    oThis.imageCid = null;
    oThis.metadataCid = null;
    oThis.fileName = null;
    oThis.downloadFilePath = null;

    oThis.ipfsObjectMap = {};
    oThis.ipfsObjectIds = [];
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;
    await oThis._validateAndSanitize();

    await oThis.createIPFSObjectForImage();

    await oThis.createIPFSObjectForWhisper();

    oThis._deleteLocalFile();

    return oThis._prepareResponse();
  }

  /**
   * Validate params.
   *
   * @private
   */
  _validateAndSanitize() {
    const oThis = this;

    const paramErrors = [];

    if (!CommonValidators.validateStringLength(oThis.description, 400)) {
      paramErrors.push('invalid_image_description_length');
    }

    if (paramErrors.length > 0) {
      return Promise.reject(
        responseHelper.paramValidationError({
          internal_error_identifier: 'a_s_l_gio_vas_1',
          api_error_identifier: 'invalid_api_params',
          params_error_identifiers: paramErrors,
          debug_options: {
            description: oThis.description
          }
        })
      );
    }
  }

  async createIPFSObjectForImage() {
    const oThis = this;
    try {
      oThis.downloadFilePath = await new FileIo().download(oThis.s3Url, 'png');

      console.log('* Downloading file from S3');
      oThis.fileName = oThis.downloadFilePath.split('/').at(-1);
      const localFileData = fs.readFileSync(oThis.downloadFilePath);
      console.log('** Download file completed from S3');

      console.log('* Upload image to IPFS');
      oThis.imageCid = await new Ipfs().uploadImage(oThis.fileName, localFileData);
      console.log('** Upload image to IPFS completed:', oThis.imageCid);

      const insertData = {
        kind: ipfsObjectConstant.image,
        cid: oThis.imageCid
      };

      const insertResponse = await new IpfsObjectsModel().insertIpfsObject(insertData);

      if (insertResponse.affectedRows == 0) {
        return Promise.reject(
          responseHelper.error({
            internal_error_identifier: 'a_s_w_gim_gimi_1',
            api_error_identifier: 'something_went_wrong',
            debug_options: {
              cid: oThis.imageCid,
              metadataCid: oThis.metadataCid
            }
          })
        );
      }

      const ipfsObject = {
        id: insertResponse.insertId,
        uts: Date.now(),
        cid: oThis.imageCid,
        entityKind: ipfsObjectConstant.image,
        entityId: insertResponse.insertId
      };

      oThis.ipfsObjectIds.push(insertResponse.insertId);
      oThis.ipfsObjectMap[insertResponse.insertId] = ipfsObject;
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_w_gim_gimi_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            s3Url: oThis.s3Url,
            error: error
          }
        })
      );
    }
  }

  async createIPFSObjectForWhisper() {
    const oThis = this;
    try {
      console.log('* Upload meta data to IPFS');
      oThis.metadataCid = await new Ipfs().uploadMetaData(oThis.fileName, oThis.imageCid, oThis.description);
      console.log('** Upload meta data to IPFS completed:', oThis.metadataCid);

      const insertData = {
        kind: ipfsObjectConstant.whisper,
        cid: oThis.metadataCid
      };

      const insertResponse = await new IpfsObjectsModel().insertIpfsObject(insertData);

      if (insertResponse.affectedRows == 0) {
        return Promise.reject(
          responseHelper.error({
            internal_error_identifier: 'a_s_w_gim_gimw_1',
            api_error_identifier: 'Something_went_wrong',
            debug_options: {
              cid: oThis.imageCid,
              metadataCid: oThis.metadataCid
            }
          })
        );
      }

      insertData.id = insertResponse.insertId;

      const ipfsObject = {
        id: insertResponse.insertId,
        uts: Date.now(),
        cid: oThis.metadataCid,
        entityKind: ipfsObjectConstant.whisper,
        entityId: insertResponse.insertId
      };

      oThis.ipfsObjectIds.push(insertResponse.insertId);
      oThis.ipfsObjectMap[insertResponse.insertId] = ipfsObject;
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_w_gim_gimw_2',
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
  _deleteLocalFile() {
    const oThis = this;

    console.log('* Deleting local file');
    fs.rm(oThis.downloadFilePath, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
    console.log('** Deleting local file completed');
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
      [entityTypeConstants.ipfsObjectIds]: oThis.ipfsObjectIds,
      [entityTypeConstants.ipfsObjects]: oThis.ipfsObjectMap
    });
  }
}

module.exports = GetIPFSMetada;
