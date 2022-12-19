const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `chains` (\n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
    '  `platform` tinyint(4) NOT NULL,\n' +
    '  `platform_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `platform_url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `start_ts` int(11) NOT NULL,\n' +
    '  `image_id` bigint(20) NOT NULL,\n' +
    '  `ipfs_object_id`  bigint(20) NOT NULL,\n' +
    '  `status` tinyint(4) NOT NULL,\n' +
    '  `created_at` int(11) NOT NULL,\n' +
    '  `updated_at` int(11) NOT NULL,\n' +
    '  PRIMARY KEY (`id`),\n' +
    '  UNIQUE KEY `uk_1` (platform, start_ts) \n' +
    '  KEY `index_1` (platform_id, platform), \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=2345 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `chains`;'];

const CreateChainsTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['chains']
};

module.exports = CreateChainsTable;
