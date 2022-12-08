const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.entityDbName;
const dbKind = DbKindConstant.sqlDbKind;

const upQuery =
  'CREATE TABLE `images` ( \n' +
  '`id` bigint unsigned NOT NULL AUTO_INCREMENT, \n' +
  '`url_template` varchar(500) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL, \n' +
  '`resolutions` text CHARACTER SET utf8 COLLATE utf8_unicode_ci, \n' +
  '`status` tinyint unsigned NOT NULL DEFAULT 1, \n' +
  '`resize_status` tinyint unsigned NOT NULL DEFAULT 1, \n' +
  '`kind` tinyint unsigned NOT NULL, \n' +
  '`created_at` int NOT NULL, \n' +
  '`updated_at` int NOT NULL, \n' +
  'PRIMARY KEY (`id`) \n' +
  ') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';

const downQuery = 'DROP table if exists images;';

const migrationName = {
  dbName: dbName,
  up: [upQuery],
  down: [downQuery],
  dbKind: dbKind,
  tables: ['images']
};

module.exports = migrationName;
