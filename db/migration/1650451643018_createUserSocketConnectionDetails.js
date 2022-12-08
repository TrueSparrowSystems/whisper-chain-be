const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.socketDbName;

const dbKind = DbKindConstant.sqlDbKind;

const upQueries = [
  'CREATE TABLE `user_socket_connection_details` ( \n' +
    ' `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT, \n' +
    ' `user_id` bigint(20) unsigned NOT NULL, \n' +
    ' `auth_key` varchar(255) COLLATE utf8_unicode_ci, \n' +
    ' `auth_key_expiry_at` int(11) DEFAULT NULL, \n' +
    ' `socket_identifier` varchar(255) DEFAULT NULL, \n' +
    ' `status` tinyint(4) NOT NULL, \n' +
    ' `created_at` int(11) NOT NULL, \n' +
    ' `updated_at` int(11) NOT NULL, \n' +
    '  PRIMARY KEY (`id`), \n' +
    '  INDEX idx_1 (`user_id`), \n' +
    '  INDEX idx_2 (`user_id`, `status`)\n' +
    ')  ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `user_socket_connection_details`;'];

const createUserSocketConnectionDetails = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['user_socket_connection_details']
};

module.exports = createUserSocketConnectionDetails;
