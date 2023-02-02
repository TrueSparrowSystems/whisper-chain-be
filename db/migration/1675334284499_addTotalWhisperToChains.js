const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = ['ALTER TABLE `chains` \n\
    ADD COLUMN `total_whispers` bigint(20) NOT NULL;'];

const downQueries = ['ALTER TABLE `chains` DROP `total_whispers`;'];

const AddTotalWhisperToChains = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['chains']
};

module.exports = AddTotalWhisperToChains;
