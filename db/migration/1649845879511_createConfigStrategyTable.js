const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.configDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `config_strategies` ( \n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT, \n' +
    '  `kind` tinyint(4) NOT NULL, \n' +
    '  `status` tinyint(4) NOT NULL, \n' +
    '  `unencrypted_params` text COLLATE utf8_unicode_ci NOT NULL, \n' +
    '  `encrypted_params` text COLLATE utf8_unicode_ci, \n' +
    '  `created_at` int(11) NOT NULL, \n' +
    '  `updated_at` int(11) NOT NULL, \n' +
    '  PRIMARY KEY (`id`), \n' +
    '  UNIQUE KEY `uk_kind` (`kind`) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `config_strategies`;'];

const createConfigStrategyTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['config_strategies']
};
module.exports = createConfigStrategyTable;
