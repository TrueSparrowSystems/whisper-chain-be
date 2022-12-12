const rootPrefix = '../../../',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  FileIo = require(rootPrefix + '/lib/fileIo/FileIo'),
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
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.s3Url = params.s3_url;

    oThis.imageCid = null;
    oThis.metadataCid = null;
  }

  async getIPFSDetails() {
    const oThis = this;
    try {
      const downloadFilePath = await new FileIo().download(oThis.s3Url, 'png');

      console.log('* Downloading file from S3');
      const fileName = downloadFilePath.split('/').at(-1);
      const localFileData = fs.readFileSync(downloadFilePath);
      console.log('** Download file completed from S3');

      console.log('* Upload image to IPFS');
      oThis.imageCid = await new Ipfs().uploadImage(fileName, localFileData);
      console.log('** Upload image to IPFS completed:', oThis.imageCid);

      console.log('* Upload meta data to IPFS');
      oThis.metadataCid = await new Ipfs().uploadMetaData(fileName, oThis.imageCid);
      console.log('** Upload meta data to IPFS completed:', oThis.metadataCid);

      console.log('* Deleting local file');
      fs.rm(downloadFilePath, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
      });
      console.log('** Deleting local file completed');
    } catch (error) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_w_gim_1',
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
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis.getIPFSDetails();

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
      image: oThis.imageCid,
      metadata: oThis.metadataCid
    });
  }
}

module.exports = GetIPFSMetada;
