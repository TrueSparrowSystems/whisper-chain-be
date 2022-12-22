const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `user_eth_addresses` (\n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
    '  `user_id` bigint(20) NOT NULL,\n' +
    '  `eth_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,\n' +
    '  `platform` tinyint(4) NOT NULL,\n' +
    '  `eth_address_kind` tinyint(4) NOT NULL,\n' +
    '  `created_at` int(11) NOT NULL,\n' +
    '  `updated_at` int(11) NOT NULL,\n' +
    '  PRIMARY KEY (`id`),\n' +
    '  KEY `index_1` (user_id), \n' +
    '  KEY `index_2` (eth_address) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=34567 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `user_eth_addresses`;'];

const CreateUserEthAddressesTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['user_eth_addresses']
};

module.exports = CreateUserEthAddressesTable;
