const program = require('commander');
const telegramBot = require('node-telegram-bot-api');
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

    oThis.imageDir = '/tmp';
    oThis.telegramBotToken = coreConstants.TELEGRAM_BOT_TOKEN;
    oThis.bot = null;
    oThis.processMessageCount = 0;
    oThis.onResolve = null;
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

    console.log('Starting seed Image cron--------------------------\n');

    oThis.cronStarted = true;
    oThis.canExit = false;

    oThis.bot = new telegramBot(oThis.telegramBotToken, { polling: true });

    await oThis._seedImageFromTelegram();

    return responseHelper.successWithData({});
  }

  /**
   * Seed Image from Telegram
   *
   * @returns {Promise<void>}
   * @private
   */
  _seedImageFromTelegram() {
    const oThis = this;

    return new Promise(function(onResolve) {
      oThis.onResolve = onResolve;

      oThis.bot.on('polling_error', async function(err) {
        console.log(' Message Error --------------');
        oThis.bot.emit('polling_error', err);
      });

      // Listen for any kind of message. There are different kinds of messages.
      oThis.bot.on('message', async function(msg) {
        const messageContext = {};

        oThis.processMessageCount++;
        messageContext.message = msg;
        messageContext.isSucess = true;
        const chatId = msg.chat.id;

        console.log('_seedImageFromTelegram Message --------------', messageContext.message);

        try {
          if (messageContext.message && !messageContext.message.photo) {
            throw new Error('Photo is not present in image.');
          }

          await oThis._validateWhitelistedUser(messageContext);

          await oThis._getImageFromMessage(messageContext);

          await oThis._getImageFileForDownload(messageContext);

          await oThis._downloadImage(messageContext);

          await oThis._uploadImageToS3(messageContext);

          await oThis._createEntryInImage(messageContext);

          await oThis._createEntryInPlatformChainSeed(messageContext);
        } catch (error) {
          messageContext.isSucess = false;
          console.log('Deleting unprocessed message---------', chatId, msg.message_id);
          await oThis.bot.deleteMessage(chatId, msg.message_id);
          console.error(`Error while seeding image: ${error}  ${msg.message_id}`);
        }
        // Send a message to the chat acknowledging receipt of their message
        let rspMsg;
        if (messageContext.isSucess) {
          rspMsg = 'Received image. Seeding process is completed!';
        } else {
          rspMsg = 'Something went wrong!';
        }
        await oThis.bot.sendMessage(chatId, rspMsg);
        oThis.processMessageCount--;

        if (oThis.processMessageCount == 0) {
          oThis.canExit = true;
        }
      });
    });
  }

  /**
   * Validate whitelisted users
   *
   * @param messageContext
   *
   * @returns {Promise<void>}
   * @private
   */
  async _validateWhitelistedUser(messageContext) {
    const userIds = coreConstants.TELEGRAM_WHITELISTED_USER_IDS;

    console.log('_validateWhitelistedUser --------------', userIds);

    if (!userIds.includes(messageContext.message.from.id)) {
      throw new Error('You are not an Admin.');
    }
  }

  /**
   * Get image with maximum size image
   *
   * @param messageContext
   * @returns {Promise<void>}
   * @private
   */
  async _getImageFromMessage(messageContext) {
    let fileSize = Number.MIN_VALUE;

    for (const photo of messageContext.message.photo) {
      fileSize = Math.max(fileSize, photo.file_size);

      if (fileSize == photo.file_size) {
        messageContext.maxPhoto = photo;
      }
    }

    console.log('_getImageFromMessage maxPhoto -----------', messageContext.maxPhoto);
  }

  /**
   * Get file path of image
   *
   * @param messageContext
   * @returns {Promise<void>}
   * @private
   */
  async _getImageFileForDownload(messageContext) {
    const oThis = this;

    if (!messageContext.maxPhoto) {
      return;
    }

    const fileId = messageContext.maxPhoto.file_id;
    console.log(' _getImageFileForDownload  file Id -----------', fileId);

    const response = await fetch(`https://api.telegram.org/bot${oThis.telegramBotToken}/getFile?file_id=${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const res = await response.json();

    console.log('_getImageFileForDownload response -----------', res);
    messageContext.filePath = res.result.file_path;

    console.log('File Path  -----------', messageContext.filePath);
  }

  /**
   * Download image on local
   *
   * @param messageContext
   *
   * @returns {Promise<void>}
   * @private
   */
  async _downloadImage(messageContext) {
    const oThis = this;

    if (!messageContext.filePath) {
      return;
    }

    const downloadURL = `https://api.telegram.org/file/bot${oThis.telegramBotToken}/${messageContext.filePath}`;

    console.log('_downloadImage downloadURL --------------------', downloadURL);

    messageContext.localFilePath = `${oThis.imageDir}/${messageContext.filePath}`;

    basicHelper.ensureDirectoryExistence(messageContext.localFilePath);

    console.log('_downloadImage localFilePath --------------------', messageContext.localFilePath);

    await oThis._downloadRemoteFile(downloadURL, messageContext.localFilePath);
  }

  /**
   * Upload image to S3
   *
   * @param messageContext
   *
   * @returns {Promise<void>}
   * @private
   */
  async _uploadImageToS3(messageContext) {
    const oThis = this;

    console.log('local file path ------------------', messageContext.localFilePath);

    const s3FilePath = `stability/${Date.now()}`;

    await oThis._putObject('whisperchain-staging-static-files', s3FilePath, messageContext);

    fs.unlinkSync(messageContext.localFilePath);

    console.log('Local Image Deleted at path', messageContext.localFilePath);

    console.log('S3 image url--------', messageContext.s3Url);
  }

  /**
   * Upload image to S3 bucket
   *
   * @param bucket
   * @param S3FilePath
   * @param messageContext
   * @returns {Promise<unknown>}
   * @private
   */
  async _putObject(bucket, S3FilePath, messageContext) {
    const oThis = this;

    const AWSS3 = await oThis._getInstance();

    const params = {
      Bucket: bucket,
      Key: S3FilePath,
      Body: fs.createReadStream(messageContext.localFilePath),
      ACL: 'public-read',
      ContentType: 'image/png'
    };

    return new Promise(function(onResolve) {
      console.log('params-------', JSON.stringify(params));
      AWSS3.upload(params)
        .promise()
        .then(function(resp) {
          const location = { url: resp.Location || '' };
          messageContext.s3Url = location;
          onResolve(console.log('success', resp));
        })
        .catch(function(err) {
          console.log('err-------', err);
        });
    });
  }

  /**
   * Get S3 Instance
   *
   * @returns {Promise<S3>}
   * @private
   */
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
   * @params messageContext
   *
   * @returns {Promise<void>}
   * @private
   */
  async _createEntryInImage(messageContext) {
    const param = { url: messageContext.s3Url.url };
    messageContext.imageId = await new ImageModel().insertUrl(param);
  }

  /**
   * Create Entry in PlatformChainSeed
   *
   * @returns {Promise<never>}
   * @private
   */
  async _createEntryInPlatformChainSeed(messageContext) {
    const param = {
      image_id: messageContext.imageId,
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

  async _customHandle() {
    const oThis = this;

    if (oThis.processMessageCount == 0) {
      oThis.canExit = true;
    }

    if (oThis.onResolve) {
      oThis.onResolve();
    }
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

setInterval(function() {
  logger.info('Ending the process. Sending SIGINT.');
  process.emit('SIGINT');
}, 30 * 60 * 1000);
