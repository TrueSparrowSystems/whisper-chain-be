const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.userDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `users` ( \n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT, \n' +
    '  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,\n' +
    '  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL, \n' +
    '  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL, \n' +
    '  `cookie_token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL, \n' +
    '  `encryption_salt` blob NULL, \n' +
    '  `properties` tinyint(4) NOT NULL DEFAULT 0, \n' +
    '  `status` tinyint(4) NOT NULL DEFAULT 1, \n' +
    '  `created_at` int(11) NOT NULL, \n' +
    '  `updated_at` int(11) NOT NULL, \n' +
    '  PRIMARY KEY (`id`), \n' +
    '  UNIQUE KEY `uk_email` (`email`) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `users`;'];

const createUsersTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['users']
};

module.exports = createUsersTable;
