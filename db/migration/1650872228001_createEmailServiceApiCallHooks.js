const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.bigDbName;
const dbKind = DbKindConstant.sqlDbKind;

const upQuery =
  'CREATE TABLE `email_service_api_call_hooks` (\n' +
  '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
  '  `receiver_entity_id` int(11) NOT NULL,\n' +
  '  `receiver_entity_kind` tinyint(4) NOT NULL,\n' +
  '  `event_type` tinyint(4) NOT NULL,\n' +
  '  `custom_description` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,\n' +
  '  `execution_timestamp` int(11) NOT NULL,\n' +
  '  `lock_identifier` decimal(22,10) DEFAULT NULL,\n' +
  '  `locked_at` int(11) DEFAULT NULL,\n' +
  '  `status` int(11) NOT NULL DEFAULT 1,\n' +
  '  `failed_count` int(11) NOT NULL DEFAULT 0,\n' +
  '  `params` text COLLATE utf8_unicode_ci,\n' +
  '  `success_response` text COLLATE utf8_unicode_ci,\n' +
  '  `failed_response` text COLLATE utf8_unicode_ci,\n' +
  '  `created_at` int(11) NOT NULL,\n' +
  '  `updated_at` int(11) NOT NULL,\n' +
  '  PRIMARY KEY (`id`),\n' +
  '  KEY `index_1` (`execution_timestamp`,`status`),\n' +
  '  KEY `index_2` (`lock_identifier`)\n' +
  ') ENGINE=InnoDB AUTO_INCREMENT=100000 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';

const downQuery = 'DROP TABLE if EXISTS `email_service_api_call_hooks`;';

const createEmailServiceApiCallHooks = {
  dbName: dbName,
  up: [upQuery],
  down: [downQuery],
  dbKind: dbKind,
  tables: ['email_service_api_call_hooks']
};

module.exports = createEmailServiceApiCallHooks;
