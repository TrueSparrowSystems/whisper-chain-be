const program = require('commander');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const https = require('https');
const AWS = require('aws-sdk');

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  platformChainSeedsConstants = require(rootPrefix + '/lib/globalConstant/platformChainSeeds'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  PlatformChainSeedModel = require(rootPrefix + '/app/models/mysql/main/PlatformChainSeeds'),
  basicHelper = require(rootPrefix + '/helpers/basic');

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node lib/cron/seedImage.js  ');
  logger.log('');
  logger.log('');
});

/**
 * Class for seed an image.
 *
 * @class SeedImage
 */
class SeedImage extends CronBase {
  constructor() {
    super();
    const oThis = this;

    oThis.message = null;
    oThis.maxPhoto = null;
    oThis.telegramBotToken = null;
    oThis.filePath = null;
    oThis.imageDir = '/tmp';
    oThis.imageId = null;
    oThis.localFilePath = null;
    oThis.s3Url = null;
  }

  /**
   * Start the executable.
   *
   * @sets oThis.cronStarted
   * @sets oThis.canExit
   *
   * @returns {Promise<any>}
   * @private
   */
  async _start() {
    const oThis = this;

    oThis.cronStarted = true;
    oThis.canExit = false;

    await oThis._seedImageFromTelegram();

    return responseHelper.successWithData({});
  }

  /**
   * Seed Image from Telegram
   *
   * @sets oThis.telegramBotToken
   *
   * @returns {Promise<void>}
   * @private
   */
  async _seedImageFromTelegram() {
    const oThis = this;

    oThis.telegramBotToken = coreConstants.TELEGRAM_BOT_TOKEN;

    const bot = await new TelegramBot(oThis.telegramBotToken, { polling: true });

    // Listen for any kind of message. There are different kinds of messages.

    await bot.on('message', async function(msg) {
      oThis.message = msg;
      const chatId = msg.chat.id;

      console.log('_seedImageFromTelegram Message --------------', oThis.message);

      try {
        if (oThis.message && !oThis.message.photo) {
          return;
        }

        if (await oThis._validateWhitelistedUser()) {
          bot.sendMessage(oThis.message.chat.id, 'You are not an Admin.');
          console.log('Request from unauthorised user');

          return;
        }

        await oThis._getImageFromMessage();

        await oThis._getImageFileForDownload();

        await oThis._downloadImage();

        await oThis._uploadImageToS3();

        await oThis._createEntryInImage();

        await oThis._createEntryInPlatformChainSeed();
      } catch (error) {
        console.error(`Error while seeding image: ${error}`);
      }
      // Send a message to the chat acknowledging receipt of their message
      bot.sendMessage(chatId, 'Received Image and Seeding process is completed!');
    });
  }

  /**
   * Get image with maximum size image
   *
   * @sets oThis.maxPhoto
   * @returns {Promise<void>}
   * @private
   */
  async _validateWhitelistedUser() {
    const oThis = this;
    const userIds = coreConstants.TELEGRAM_WHITELISTED_USER_IDS;

    console.log('_validateWhitelistedUser --------------', userIds);

    return !userIds.includes(oThis.message.from.id);
  }

  /**
   * Get image with maximum size image
   *
   * @sets oThis.maxPhoto
   * @returns {Promise<void>}
   * @private
   */
  async _getImageFromMessage() {
    const oThis = this;

    if (!oThis.message.photo) {
      return;
    }

    let fileSize = Number.MIN_VALUE;

    console.log('_getImageFromMessage photo -----------------', oThis.message.photo);

    for (const photo of oThis.message.photo) {
      fileSize = Math.max(fileSize, photo.file_size);

      if (fileSize == photo.file_size) {
        oThis.maxPhoto = photo;
      }
    }

    console.log('_getImageFromMessage oThis.maxPhoto -----------', oThis.maxPhoto);
  }

  /**
   * Get file path of image
   *
   * @sets oThis.filePath
   *
   * @returns {Promise<void>}
   * @private
   */
  async _getImageFileForDownload() {
    const oThis = this;

    if (!oThis.maxPhoto) {
      return;
    }

    const fileId = oThis.maxPhoto.file_id;
    console.log(' _getImageFileForDownload  file Id -----------', fileId);
    console.log('_getImageFileForDownload telegramBotToken -----------', oThis.telegramBotToken);

    const response = await fetch(`https://api.telegram.org/bot${oThis.telegramBotToken}/getFile?file_id=${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const res = await response.json();

    console.log('_getImageFileForDownload response -----------', res);
    oThis.filePath = res.result.file_path;

    console.log('File Path  -----------', oThis.filePath);
  }

  /**
   * Download image on local
   *
   * @returns {Promise<void>}
   * @private
   */
  async _downloadImage() {
    const oThis = this;

    if (!oThis.filePath) {
      return;
    }

    const downloadURL = `https://api.telegram.org/file/bot${oThis.telegramBotToken}/${oThis.filePath}`;

    console.log('_downloadImage downloadURL --------------------', downloadURL);

    oThis.localFilePath = `${oThis.imageDir}/${oThis.filePath}`;

    basicHelper.ensureDirectoryExistence(oThis.localFilePath);

    console.log('_downloadImage localFilePath --------------------', oThis.localFilePath);

    await oThis._downloadRemoteFile(downloadURL, oThis.localFilePath);
  }

  /**
   * Upload image to S3
   *
   * @returns {Promise<void>}
   * @private
   */
  async _uploadImageToS3() {
    const oThis = this;

    console.log('local file path ------------------', oThis.localFilePath);

    await oThis._putObject('whisperchain-staging-static-files', `stability${oThis.filePath}`);

    fs.unlinkSync(oThis.localFilePath);

    console.log('Local Image Deleted at path', oThis.localFilePath);

    console.log('S3 image url--------', oThis.s3Url);
  }

  /**
   * Upload image to S3 bucket
   *
   * @param bucket
   * @param S3FilePath
   * @returns {Promise<unknown>}
   * @private
   */
  async _putObject(bucket, S3FilePath) {
    const oThis = this;

    const AWSS3 = await oThis._getInstance();

    const params = {
      Bucket: bucket,
      Key: S3FilePath,
      Body: fs.createReadStream(oThis.localFilePath),
      ACL: 'public-read',
      ContentType: 'image/png'
    };

    return new Promise(function(onResolve) {
      console.log('params-------', JSON.stringify(params));
      AWSS3.upload(params)
        .promise()
        .then(function(resp) {
          const location = { url: resp.Location || '' };
          oThis.s3Url = location;
          onResolve(console.log('success', resp));
        })
        .catch(function(err) {
          console.log('err-------', err);
        });
    });
  }

  async _getInstance() {
    const AWSInstance = new AWS.S3({
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    });

    return AWSInstance;
  }

  /**
   * Create Image table entry
   *
   * @sets oThis.imageId
   *
   * @returns {Promise<void>}
   * @private
   */
  async _createEntryInImage() {
    const oThis = this;

    const param = { url: oThis.s3Url.url };
    oThis.imageId = await new ImageModel().insertUrl(param);
  }

  /**
   * Create Entry in PlatformChainSeed
   *
   * @returns {Promise<never>}
   * @private
   */
  async _createEntryInPlatformChainSeed() {
    const oThis = this;

    const param = {
      image_id: oThis.imageId,
      is_published:
        platformChainSeedsConstants.invertedPublicationStatus[platformChainSeedsConstants.notPublishedStatus],
      platform: 0,
      start_ts: Date.now() / 1000
    };

    const insertResponse = await new PlatformChainSeedModel().insertRecord(param);

    if (insertResponse.affectedRows !== 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_s_l_ci_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            insertParams: param
          }
        })
      );
    }

    console.log('Successful insertion');
  }

  /**
   * Download file to local from remote URL.
   *
   * @param url
   * @param targetFilePath
   * @returns {Promise<unknown>}
   * @private
   */
  async _downloadRemoteFile(url, targetFilePath) {
    const oThis = this;

    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          const code = response.statusCode || 0;

          if (code >= 400) {
            return reject(new Error(response.statusMessage));
          }

          // Handle redirects
          if (code > 300 && code < 400 && !!response.headers.location) {
            return oThis._downloadRemoteFile(response.headers.location, targetFilePath);
          }
          // Save the file to disk
          const fileWriter = fs.createWriteStream(targetFilePath).on('finish', () => {
            resolve({});
          });

          response.pipe(fileWriter);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
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

const performerObj = new SeedImage();
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
