const program = require('commander');
const TelegramBot = require('node-telegram-bot-api');

const rootPrefix = '../..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

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

    await oThis._readMessageFromTelegramBot();

    oThis.canExit = true;

    return responseHelper.successWithData({});
  }

  async _readMessageFromTelegramBot() {
    const oThis = this;

    oThis.telegramBotToken = coreConstants.TELEGRAM_BOT_TOKEN;

    const bot = await new TelegramBot(oThis.telegramBotToken, { polling: true });

    // Listen for any kind of message. There are different kinds of messages.
    await bot.on('photo', async function(msg) {
      oThis.message = msg;
      //const chatId = msg.chat.id;

      console.log('Message------------', oThis.message);

      await oThis._getImageFromMessage();

      await oThis._getImageFileForDownload();

      await oThis._downloadImage();

      await oThis._uploadImageToS3();

      await oThis._createEntryInImage();

      await oThis._createEntryInPlatformChainSeed();

      // send a message to the chat acknowledging receipt of their message
      // bot.sendMessage(chatId, 'Received your message');
    });

    console.log('Message--------------------', oThis.message);
  }

  async _getImageFromMessage() {
    const oThis = this;

    if (!oThis.message) {
      return;
    }
    let fileSize = Number.MIN_VALUE;

    console.log('_getImageFromMessage present -----------------', oThis.message);
    console.log('photo -----------------', oThis.message.photo);

    for (const photo of oThis.message.photo) {
      fileSize = Math.max(fileSize, photo.file_size);

      if (fileSize == photo.file_size) {
        oThis.maxPhoto = photo;
      }
    }

    console.log('oThis.maxPhoto -----------', oThis.maxPhoto);
  }

  async _getImageFileForDownload() {
    const oThis = this;

    console.log('Here _getImageFileForDownload -----------');

    try {
      const fileId = oThis.maxPhoto.file_id;
      console.log('Here _getImageFileForDownload -----------', fileId);
      console.log('Here _getImageFileForDownload -----------', oThis.telegramBotToken);

      const response = await fetch(`https://api.telegram.org/bot${oThis.telegramBotToken}/getFile?file_id=${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const res = await response.json();

      console.log('_getImageFileForDownload response -----------', response, res);
    } catch (error) {
      console.log('Error -----------', error);
    }
  }

  async _downloadImage() {
    const oThis = this;
  }

  async _uploadImageToS3() {
    const oThis = this;
  }

  async _createEntryInImage() {
    const oThis = this;
  }

  async _createEntryInPlatformChainSeed() {
    const oThis = this;
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
