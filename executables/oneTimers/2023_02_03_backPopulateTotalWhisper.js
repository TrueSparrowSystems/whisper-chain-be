const rootPrefix = '../..',
  ChainModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
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
    const oThis = this;

    // UPDATE chains SET total_whispers = (select count(*) from whispers where whispers.chain_id=chains.id);

    // TODO total_whispers - query should consider only those whispers which are of ACTIVE status.
    const whispers = [];
    const dbRows = await new WhispersModel()
      .select('count(*) as total_whispers, chain_id')
      .group_by('chain_id')
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      whispers.push({ total_whispers: dbRows[index].total_whispers, chain_id: dbRows[index].chain_id });
    }

    //console.log(whispers);

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
