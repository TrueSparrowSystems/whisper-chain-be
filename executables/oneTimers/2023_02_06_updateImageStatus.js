// Deactive unavailable image whispers and chains

const program = require('commander');
const rootPrefix = '../..',
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  ImageModel = require(rootPrefix + '/app/models/mysql/main/Images'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  ChainsModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  chainConstants = require(rootPrefix + '/lib/globalConstant/chains'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

program.allowUnknownOption();
program.option('--dryRun <dryRun>', 'Dry Run').parse(process.argv);

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log(' node lib/oneTimers/deactivateChainWithInvalidImages.js --dryRun 1');
  logger.log('');
  logger.log('');
});

const dryRun = program.opts().dryRun || 0;

class WhisperDeactivation {
  constructor(params) {
    const oThis = this;

    oThis.dryRun = Number(params.dryRun);
    oThis.imagesMap = {};
    oThis.unavailableImages = [];
  }

  /**
   * Start the executable.
   *
   * @sets oThis.canExit
   *
   * @returns {Promise<any>}
   * @private
   */
  async perform() {
    const oThis = this;

    await oThis._fetchImages();

    await oThis._collectImageIds();

    await oThis._deactiveWhispers();

    return responseHelper.successWithData({});
  }

  async _fetchImages() {
    const oThis = this;

    const imageObj = await new ImageModel();
    const dbRows = await imageObj.select('*').fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = imageObj.formatDbData(dbRows[index]);
      oThis.imagesMap[formatDbRow.id] = formatDbRow;
    }
  }

  async _collectImageIds() {
    const oThis = this;

    for (const id in oThis.imagesMap) {
      const imageMap = oThis.imagesMap[id];

      const imageUrl = imageMap.url;

      try {
        if (imageUrl) {
          if (!imageUrl.startsWith('http')) {
            oThis.unavailableImages.push(imageMap.id);
            console.log('discarded ', imageUrl);
            continue;
          }
          const response = await fetch(imageUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'image/png'
            }
          });

          if (response.status != '200') {
            console.log('discarded ', imageUrl);
            oThis.unavailableImages.push(imageMap.id);
          }
        }
      } catch (err) {
        console.log('Error While fetching', err, imageUrl);
      }
    }

    console.log('unavailable image ids array---------', oThis.unavailableImages);
  }

  async _deactiveWhispers() {
    const oThis = this;

    const updatedResponse = await new WhispersModel()
      .update({ status: whispersConstants.invertedStatuses[whispersConstants.inactiveStatus] })
      .where({ image_id: oThis.unavailableImages })
      .fire();

    console.log('Number of Rows updated in Whisper model:', updatedResponse.affectedRows);
  }

  async _deactiveChains() {
    const oThis = this;

    const updatedResponse = await new ChainsModel()
      .update({ status: chainConstants.invertedStatuses[chainConstants.inactiveStatus] })
      .where({ image_id: oThis.unavailableImages })
      .fire();

    console.log('Number of Rows updated in Chains model:', updatedResponse.affectedRows);
  }
}
const performer = new WhisperDeactivation({ dryRun });

performer
  .perform()
  .then(function() {
    logger.log('Done.');
    process.exit(0);
  })
  .catch(function(err) {
    logger.error('Error: ', err);
    process.exit(1);
  });
