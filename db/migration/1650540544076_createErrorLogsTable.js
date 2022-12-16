const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;

const dbKind = DbKindConstant.sqlDbKind;

const upQueries = [
  'CREATE TABLE `error_logs` ( \n' +
    ' `id` bigint(20) NOT NULL AUTO_INCREMENT, \n' +
    ' `app` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `env_id` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `severity` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `machine_ip` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `kind` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `data` text, \n' +
    ' `status` varchar(255) COLLATE utf8_unicode_ci NOT NULL, \n' +
    ' `retry_count` int(11) DEFAULT 0, \n' +
    ' `created_at` DATETIME NOT NULL, \n' +
    ' `updated_at` DATETIME NOT NULL, \n' +
    ' PRIMARY KEY (`id`), \n' +
    ' KEY `index_1` (`severity`,`status`) \n' +
    ')  ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `error_logs`;'];

const createErrorLogsTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['error_logs']
};

module.exports = createErrorLogsTable;
