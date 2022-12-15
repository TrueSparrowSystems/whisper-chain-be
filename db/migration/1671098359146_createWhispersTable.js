const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.bigDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `whispers` (\n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
    '  `user_id` bigint(20) NOT NULL,\n' +
    '  `chain_id`bigint(20) NOT NULL,\n' +
    '  `image_id` bigint(20) NOT NULL,\n' +
    '  `platform` tinyint(4) NOT NULL,\n' +
    '  `platform_id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,\n' +
    '  `platform_url` varchar(255) COLLATE utf8_unicode_ci DEFAULT node,\n' +
    '  `ipfs_object_id` bigint(20) NOT NULL,\n' +
    '  `status` tinyint(4) NOT NULL,\n' +
    '  `created_at` int(11) NOT NULL,\n' +
    '  `updated_at` int(11) NOT NULL,\n' +
    '  PRIMARY KEY (`id`),\n' +
    '  UNIQUE KEY `uk_1` (image_id), \n' +
    '  KEY `index_1` (chain_id, created_at), \n' +
    '  KEY `index_2` (platform_id, status, platform_url) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `whispers`;'];

const CreateWhispersTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['whispers']
};

module.exports = CreateWhispersTable;
