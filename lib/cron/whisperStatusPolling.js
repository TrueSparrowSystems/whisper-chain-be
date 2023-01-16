const program = require('commander');

const rootPrefix = '../..',
  lensHelper = require(rootPrefix + '/helpers/lens'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  CronBase = require(rootPrefix + '/lib/cron/CronBase'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node lib/cron/whisperStatusPolling.js    ');
  logger.log('');
  logger.log('');
});
class WhisperStatusPolling extends CronBase {
  constructor() {
    super();
    const oThis = this;

    oThis.whispers = [];
  }

  async getWhispers() {
    const oThis = this;

    const whispersArray = await new WhispersModel().fetchWhispersByStatus(whispersConstants.processingStatus);
    oThis.whispers = whispersArray;

    return;
  }

  async pollingAndStatusUpdate() {
    const oThis = this;

    if (oThis.whispers.length > 0) {
      for (const whisper of oThis.whispers) {
        const txHash = whisper.platformId;
        const metadataStatus = await lensHelper.getPublicationMetadataStatus(txHash);
        if (metadataStatus.data.publicationMetadataStatus.status === 'SUCCESS') {
          const publicationRes = await lensHelper.getPublicationCommentByTxHash(txHash);
          const publicationId = publicationRes.data.publication.id;
          const publicationUrl = 'https://testnet.lenster.xyz/posts/' + publicationId;

          await new WhispersModel().updateProcessingWhisper(whisper.id, publicationId, publicationUrl);
        }
      }
    }

    return;
  }

  /*
 * Main performer for Whisper Status Polling
 *
 * @returns {Promise<object>}
 */
  async operation() {
    const oThis = this;

    await oThis.getWhispers();

    await oThis.pollingAndStatusUpdate();

    return;
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

    await oThis.operation();

    oThis.canExit = true;

    return responseHelper.successWithData({});
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

const performerObj = new WhisperStatusPolling();
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
