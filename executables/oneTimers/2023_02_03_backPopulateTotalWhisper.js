const rootPrefix = '../..',
  ChainModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class update total whispers column.
 *
 * @class UpdateTotalWhisper
 */
class UpdateTotalWhisper {
  /**
   * Main performer for class.
   *
   * @returns {Promise<void>}
   */
  async perform() {
    const oThis = this;

    await oThis._addTotalWhispersInChain();
  }

  /**
   * Update data.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _addTotalWhispersInChain() {
    const whispers = [];
    const dbRows = await new WhispersModel()
      .select('count(*) as total_whispers, chain_id')
      .where({ status: whispersConstants.invertedStatuses[whispersConstants.activeStatus] })
      .group_by('chain_id')
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      whispers.push({ total_whispers: dbRows[index].total_whispers, chain_id: dbRows[index].chain_id });
    }

    if (whispers) {
      for (let index = 0; index < whispers.length; index++) {
        await new ChainModel()
          .update({ total_whispers: whispers[index].total_whispers })
          .where({ id: whispers[index].chain_id })
          .fire();
      }
    }
  }
}

new UpdateTotalWhisper()
  .perform()
  .then(function() {
    logger.win('Done.');
    process.exit(0);
  })
  .catch(function(err) {
    logger.error('Error: ', err);
    process.exit(1);
  });
