const rootPrefix = '..',
  ExecuteMysqlQuery = require(rootPrefix + '/db/ExecuteMysqlQuery'),
  database = require(rootPrefix + '/lib/globalConstant/database');

const dbName = database.mainDbName;

const schemaMigrationQuery =
  'CREATE TABLE IF NOT EXISTS `schema_migrations` ' +
  '(`version` varchar(255) COLLATE utf8_unicode_ci NOT NULL, ' +
  'PRIMARY KEY (`version`)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';

new ExecuteMysqlQuery(dbName, schemaMigrationQuery).perform();
