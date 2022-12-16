const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.mainDbName;
const dbKind = dbKindConstants.sqlDbKind;

const upQueries = [
  'CREATE TABLE `users` (\n' +
    '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
    '  `platform` tinyint(4) NOT NULL,\n' +
    '  `platform_user_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `platform_display_name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `platform_username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `platform_profile_image_id` bigint(20) NOT NULL,\n' +
    '  `cookie_token` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
    '  `status` tinyint(4) NOT NULL,\n' +
    '  `created_at` int(11) NOT NULL,\n' +
    '  `updated_at` int(11) NOT NULL,\n' +
    '  PRIMARY KEY (`id`),\n' +
    '  UNIQUE KEY `uk_1` (platform_user_id) \n' +
    ') ENGINE=InnoDB AUTO_INCREMENT=2345 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
];

const downQueries = ['DROP TABLE if exists `users`;'];

const CreateUsersTable = {
  dbName: dbName,
  up: upQueries,
  down: downQueries,
  dbKind: dbKind,
  tables: ['users']
};

module.exports = CreateUsersTable;
