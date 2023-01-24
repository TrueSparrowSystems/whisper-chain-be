const program = require('commander');
const TelegramBot = require('node-telegram-bot-api');

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  PlatformChainSeedModel = require(rootPrefix + '/app/models/mysql/main/PlatformChainSeeds');

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node lib/cron/seedImage.js  ');
  logger.log('');
  logger.log('');
});

/**
 * Class for seed a image.
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
    oThis.url = null;
    oThis.imageId = null;
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

    try {
      await oThis._seedImageFromTelegram();
    } catch (error) {
      console.log('Error while seeding image into database-----------', error);
    }

    //oThis.canExit = true;

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

      await oThis._getImageFromMessage();

      await oThis._getImageFileForDownload();

      await oThis._downloadImage();

      await oThis._uploadImageToS3();

      await oThis._createEntryInImage();

      await oThis._createEntryInPlatformChainSeed();

      // Send a message to the chat acknowledging receipt of their message
      bot.sendMessage(chatId, 'Received your message');
    });
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

    if (!oThis.message) {
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

    const downloadURL = `https://api.telegram.org/file/bot${oThis.telegramBotToken}/${oThis.filePath}`;

    console.log('_downloadImage downloadURL --------------------', downloadURL);
  }

  async _uploadImageToS3() {
    const oThis = this;
  }

  async _createEntryInImage() {
    const oThis = this;

    const param = { url: oThis.url };
    oThis.imageId = await new ImageModel().insertUrl(param);
  }

  async _createEntryInPlatformChainSeed() {
    const oThis = this;

    const param = {
      image_id: oThis.imageId,
      is_published: 2,
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
