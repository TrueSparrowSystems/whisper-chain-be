const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `platform_chain_seeds` (\n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
    '  `platform` tinyint(4) NOT NULL,\n' +
    '  `start_ts` int(11) NOT NULL,\n' +
    '  `image_id` bigint(20) NOT NULL,\n' +
    '  `is_published` tinyint(4) NOT NULL,\n' +
    '  `created_at` int(11) NOT NULL,\n' +
    '  `updated_at` int(11) NOT NULL,\n' +
    '  PRIMARY KEY (`id`),\n' +
    '  UNIQUE KEY `uk_1` (platform, start_ts) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=45678 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `platform_chain_seeds`;'];

const CreatePlatformChainSeedsTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['platform_chain_seeds']
};

module.exports = CreatePlatformChainSeedsTable;
