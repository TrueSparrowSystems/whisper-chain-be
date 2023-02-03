const program = require('commander');

const rootPrefix = '../..',
  fs = require('fs'),
  lensHelper = require(rootPrefix + '/helpers/lens'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  platformChainSeedsConstants = require(rootPrefix + '/lib/globalConstant/platformChainSeeds'),
  ipfsObjectConstants = require(rootPrefix + '/lib/globalConstant/ipfsObject'),
  Ipfs = require(rootPrefix + '/lib/Ipfs/Ipfs'),
  FileIo = require(rootPrefix + '/lib/fileIo/FileIo'),
  ImagesModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  IpfsObjectsModel = require(rootPrefix + '/app/models/mysql/main/IpfsObject'),
  ChainsModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  chainConstants = require(rootPrefix + '/lib/globalConstant/chains'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform'),
  PlatformChainSeedsModel = require(rootPrefix + '/app/models/mysql/main/PlatformChainSeeds'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node lib/cron/dailyPostPublication.js  ');
  logger.log('');
  logger.log('');
});

/**
 * Class for daily post publication.
 *
 * @class CronProcessesMonitorExecutable
 */
class DailyPostPublication extends CronBase {
  constructor() {
    super();
    const oThis = this;

    oThis.notionUrl = 'https://plgworks.notion.site/NFT-or-not-61e944ba261f49a2805c73468c92a43a';

    oThis.platformChainSeeds = {};
    oThis.images = {};
    oThis.imageId = null;
    oThis.seedPostMetadataCid = null;
    oThis.fileName = null;
    oThis.imageCid = null;
    oThis.ipfsObjectId = null;
    oThis.publicationId = null;
    oThis.userId = 1;
  }

  /**
   * Start the executable.
   *
   * @sets oThis.canExit
   *
   * @returns {Promise<any>}
   * @private
   */
  async _start() {
    const oThis = this;

    oThis.cronStarted = true;
    oThis.canExit = false;

    await oThis.fetchPublicationDetails();

    await oThis.uploadImageToIpfs();

    await oThis.uploadWhisperToIpfs();

    await oThis.createSeedPost();

    await oThis.createChain();

    await oThis.updatePlatformChainSeeds();

    oThis.canExit = true;

    return responseHelper.successWithData({});
  }

  /**
   * Fetch un published publications
   *
   * @sets oThis.images, oThis.imageId, oThis.platformChainSeeds
   * @returns {Promise<any>}
   */
  async fetchPublicationDetails() {
    const oThis = this;

    const resp = await new PlatformChainSeedsModel().fetchPlatformChainSeedsByPublicationStatus(
      platformChainSeedsConstants.notPublishedStatus
    );

    oThis.platformChainSeeds = resp[0];
    oThis.imageId = oThis.platformChainSeeds.imageId;

    const imagesModelResp = await new ImagesModel().getById(oThis.imageId);

    oThis.images = imagesModelResp[0];
  }

  /**
   * Upload image to ipfs
   *
   * @sets  oThis.imageCid
   * @returns {Promise<any>}
   */
  async uploadImageToIpfs() {
    const oThis = this;

    const downloadFilePath = await new FileIo().download(oThis.images.url, 'png');

    console.log('* Downloading file from S3');
    oThis.fileName = downloadFilePath.split('/').at(-1);
    const localFileData = fs.readFileSync(downloadFilePath);
    console.log('** Download file completed from S3');

    console.log('* Upload image to IPFS');
    oThis.imageCid = await new Ipfs().uploadImage(oThis.fileName, localFileData);
    console.log('** Upload image to IPFS completed:', oThis.imageCid);

    const insertData = {
      kind: ipfsObjectConstants.image,
      cid: oThis.imageCid
    };

    const insertResponse = await new IpfsObjectsModel().insertIpfsObject(insertData);

    oThis.ipfsObjectId = insertResponse.insertId;

    if (insertResponse.affectedRows == 0) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_c_dpp_uiti_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertResponse: insertResponse,
            insertData: insertData
          }
        })
      );
    }

    const updatedResponse = await new ImagesModel()
      .update({
        ipfs_object_id: oThis.ipfsObjectId
      })
      .where({ id: oThis.images.id })
      .fire();

    if (updatedResponse.affectedRows == 0) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_c_dpp_uiti_2',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            updatedResponse: updatedResponse
          }
        })
      );
    }

    console.log('* Deleting local file');
    fs.rm(downloadFilePath, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
    console.log('** Deleting local file completed');
  }

  /**
   * Upload whisper to ipfs
   *
   * @returns {Promise<any>}
   */
  async uploadWhisperToIpfs() {
    const oThis = this;
    // try {
    console.log('* Upload meta data to IPFS');
    oThis.seedPostMetadataCid = await new Ipfs().uploadSeedWhisperMetaData(oThis.imageCid);
    console.log('** Upload meta data to IPFS completed:', oThis.seedPostMetadataCid);

    console.log('oThis.seedPostMetadataCid', oThis.seedPostMetadataCid);

    const insertData = {
      kind: ipfsObjectConstants.chain,
      cid: oThis.seedPostMetadataCid
    };

    const insertResponse = await new IpfsObjectsModel().insertIpfsObject(insertData);

    if (insertResponse.affectedRows == 0) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_c_dpp_uwti_1',
          api_error_identifier: 'Something_went_wrong',
          debug_options: {
            insertResponse: insertResponse,
            insertData: insertData
          }
        })
      );
    }
    // } catch (error) {
    //   return Promise.reject(
    //     responseHelper.error({
    //       internal_error_identifier: 'l_c_dpp_uwti_2',
    //       api_error_identifier: 'something_went_wrong',
    //       debug_options: {
    //         s3Url: oThis.images.url,
    //         error: error
    //       }
    //     })
    //   );
    // }
  }

  /**
   * Create seed post
   *
   */
  async createSeedPost() {
    const oThis = this;

    const cid = `ipfs://${oThis.seedPostMetadataCid}`;
    const res = await lensHelper.createPostViaDispatcher(cid);

    let metadataSatus = await lensHelper.getPublicationMetadataStatus(res.data.createPostViaDispatcher.txHash);

    console.log('ipfs://${oThis.seedPostMetadataCid} ', cid);

    console.log('oThis.seedPostMetadataCid', oThis.seedPostMetadataCid);

    while (metadataSatus.data.publicationMetadataStatus.status != 'SUCCESS') {
      metadataSatus = await lensHelper.getPublicationMetadataStatus(res.data.createPostViaDispatcher.txHash);
      if (metadataSatus.data.publicationMetadataStatus.status == 'METADATA_VALIDATION_FAILED') {
        return;
      }
      console.log('metadataSatus ---> ', metadataSatus);
    }
    const publicationRes = await lensHelper.getPublicationByTxHash(res.data.createPostViaDispatcher.txHash);

    oThis.publicationId = publicationRes.data.publication.id;
  }

  /**
   * Create entry in chains table
   *
   * @returns {Promise<any>}
   */
  async createChain() {
    const oThis = this;

    const insertData = {
      user_id: platformConstants.lensPlatformUserId,
      platform: platformConstants.invertedPlatforms[platformConstants.lensPlatform],
      platform_id: oThis.publicationId,
      platform_url: 'https://testnet.lenster.xyz/posts/' + oThis.publicationId,
      start_ts: Date.now() / 1000,
      image_id: oThis.imageId,
      ipfs_object_id: oThis.ipfsObjectId,
      status: chainConstants.invertedStatuses[chainConstants.activeStatus],
      total_whispers: 0
    };

    const insertResponse = await new ChainsModel().insertRecord(insertData);

    if (insertResponse.affectedRows == 0) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'l_c_dpp_cc_1',
          api_error_identifier: 'Something_went_wrong',
          debug_options: {
            insertResponse: insertResponse,
            insertData: insertData
          }
        })
      );
    }
  }

  /**
   * Update entry in platform chain seeds table
   *
   * @returns {Promise<any>}
   */
  async updatePlatformChainSeeds() {
    const oThis = this;

    const updatedResponse = await new PlatformChainSeedsModel().updatePublicationStatusById(
      oThis.platformChainSeeds.id,
      platformChainSeedsConstants.publishedStatus,
      platformConstants.invertedPlatforms[platformConstants.lensPlatform]
    );

    if (updatedResponse.affectedRows != 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_m_ms_m_pcs_upsbi_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            id: id,
            publicationStatus: publicationStatus
          }
        })
      );
    }
  }

  /**
   * This function provides info whether the process has to exit.
   *
   * @returns {boolean}
   *
   * @private
   */
  _pendingTasksDone() {
    const oThis = this;

    return oThis.canExit;
  }
}

const performerObj = new DailyPostPublication();
performerObj
  .perform()
  .then(function() {
    console.log('** Exiting process');
    console.log('Cron last run at: ', Date.now());
    process.emit('SIGINT');
  })
  .catch(function(err) {
    console.error('** Exiting process due to Error: ', err);
    process.emit('SIGINT');
  });
