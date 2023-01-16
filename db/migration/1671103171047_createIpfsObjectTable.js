const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = DbKindConstant.sqlDbKind;

const upQuery =
  'CREATE TABLE `ipfs_objects` (\n' +
  '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
  '  `kind` tinyint(4) NOT NULL,\n' +
  '  `cid` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
  '  `created_at` int(11) NOT NULL,\n' +
  '  `updated_at` int(11) NOT NULL,\n' +
  '  PRIMARY KEY (`id`)\n' +
  ') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';

const downQuery = 'DROP TABLE if EXISTS `ipfs_objects`;';

const createIpfsObjectsTable = {
  dbName: dbName,
  up: [upQuery],
  down: [downQuery],
  dbKind: dbKind,
  tables: ['ipfs_objects']
};

module.exports = createIpfsObjectsTable;
