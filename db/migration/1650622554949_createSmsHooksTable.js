const rootPrefix = '../..',
  database = require(rootPrefix + '/lib/globalConstant/database'),
  DbKindConstant = require(rootPrefix + '/lib/globalConstant/dbKind');

const dbName = database.bigDbName;
const dbKind = DbKindConstant.sqlDbKind;

const upQuery =
  'CREATE TABLE `sms_hooks` (\n' +
  '  `id` bigint(20) NOT NULL AUTO_INCREMENT,\n' +
  '  `phone_number` varchar(255) NOT NULL,\n' +
  '  `message_kind` tinyint(4) NOT NULL,\n' +
  '  `message_payload` text COLLATE utf8mb4_unicode_ci NOT NULL,\n' +
  '  `service_message_id` varchar(255) NULL,\n' +
  '  `internal_message_id` varchar(255) NULL,\n' +
  '  `status` int(11) NOT NULL,\n' +
  '  `execution_timestamp` int(11) NOT NULL,\n' +
  '  `lock_identifier` decimal(22,10) DEFAULT NULL,\n' +
  '  `locked_at` int(11) DEFAULT NULL,\n' +
  '  `retry_count` int(11) NOT NULL DEFAULT 0,\n' +
  '  `created_at` int(11) NOT NULL,\n' +
  '  `updated_at` int(11) NOT NULL,\n' +
  '  PRIMARY KEY (`id`),\n' +
  '  KEY `idx_1` (`status`,`execution_timestamp`),\n' +
  '  KEY `idx_2` (`lock_identifier`)\n' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

const downQuery = 'drop table if exists `sms_hooks`;';

const createSmsHooksTable = {
  dbName: dbName,
  up: [upQuery],
  down: [downQuery],
  dbKind: dbKind,
  tables: ['sms_hooks']
};
module.exports = createSmsHooksTable;
