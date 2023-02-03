const rootPrefix = '../..',
  ChainModel = require(rootPrefix + '/app/models/mysql/main/Chains'),
  WhispersModel = require(rootPrefix + '/app/models/mysql/main/Whispers'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

const queryTableName = 'chains';

/**
 * Class to sanitize utm table.
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
   * Validate data.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _addTotalWhispersInChain() {
    const oThis = this;

    // UPDATE chains SET total_whispers = (select count(*) from whispers where whispers.chain_id=chains.id);

    //whispers select groups by chain_id dbRows ={chain_id, count}
    // const dbRows = await oThis
    //   .select('bundle_id, score')
    //   .where({
    //     bundle_id: bundleIds
    //   })
    //   .group_by('score, bundle_id')
    //   .order_by('bundle_id ASC, score DESC')
    //   .fire();

    const query = `UPDATE ${queryTableName} SET total_whispers = (select count(*) from whispers where whispers.chain_id=chains.id)`;

    const queryRsp = await new UtmLogModel().fire(selectQuery);

    const dbRows = queryRsp.rows;

    if (dbRows.length === 0) {
      return;
    }

    // for (let index = 0; index < dbRows.length; index++) {
    //   const formattedDbRow = new UtmLogModel().formatDbData(dbRows[index]);

    //   if (formattedDbRow.utmContent) {
    //     logger.log('Validate Remaining user Id specific Data, values: ' + JSON.stringify(formattedDbRow));
    //   }
    // }
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
