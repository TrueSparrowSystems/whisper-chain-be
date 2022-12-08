const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  smsHookConstant = require(rootPrefix + '/lib/globalConstant/big/smsHook');

const dbName = databaseConstants.bigDbName;

/**
 * Class for SMS Hook model.
 *
 * @class SmsHookModel
 */
class SmsHookModel extends ModelBase {
  /**
   * Constructor for SMS hook model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'sms_hooks';
  }

  /**
   * Format Db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {string} dbRow.phone_number
   * @param {number} dbRow.message_kind
   * @param {string} dbRow.message_payload
   * @param {string} dbRow.service_message_id
   * @param {string} dbRow.internal_message_id
   * @param {number} dbRow.execution_timestamp
   * @param {number} dbRow.lock_identifier
   * @param {number} dbRow.locked_at
   * @param {number} dbRow.status
   * @param {number} dbRow.retry_count
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @return {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      phoneNumber: dbRow.phone_number,
      messageKind: smsHookConstant.messageKinds[dbRow.message_kind],
      messagePayload: JSON.parse(dbRow.message_payload || {}),
      serviceMessageId: dbRow.service_message_id,
      internalMessageId: dbRow.internal_message_id,
      executionTimestamp: dbRow.execution_timestamp,
      lockIdentifier: dbRow.lock_identifier,
      lockedAt: dbRow.locked_at,
      status: smsHookConstant.statuses[dbRow.status],
      retryCount: dbRow.retry_count,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * Function to acquire lock on fresh hooks.
   *
   * @param {string} lockIdentifier
   *
   * @returns {Promise<any>}
   */
  async acquireLocksOnFreshHooks(lockIdentifier) {
    const oThis = this;

    const currentTs = basicHelper.getCurrentTimestampInSeconds();

    return oThis
      .update({
        lock_identifier: lockIdentifier,
        locked_at: currentTs
      })
      .where('lock_identifier IS NULL')
      .where(['execution_timestamp < ?', currentTs])
      .where(['status = ?', smsHookConstant.invertedStatuses[smsHookConstant.pendingStatus]])
      .limit(smsHookConstant.batchSizeForHooksProcessor)
      .fire();
  }

  /**
   * Function to acquire lock on failed hooks.
   *
   * @param {string} lockIdentifier
   *
   * @returns {Promise<any>}
   */
  async acquireLocksOnFailedHooks(lockIdentifier) {
    const oThis = this;

    const currentTs = basicHelper.getCurrentTimestampInSeconds();

    return oThis
      .update({
        lock_identifier: lockIdentifier,
        locked_at: currentTs
      })
      .where('lock_identifier IS NULL')
      .where(['execution_timestamp < ?', currentTs])
      .where(['retry_count <= ?', smsHookConstant.retryLimitForFailedHooks])
      .where(['status = ?', smsHookConstant.invertedStatuses[smsHookConstant.failedStatus]])
      .limit(smsHookConstant.batchSizeForHooksProcessor)
      .fire();
  }

  /**
   * Function to fetch locked hooks.
   *
   * @param {string} lockIdentifier
   *
   * @returns {Promise<void>}
   */
  async fetchLockedHooks(lockIdentifier) {
    const oThis = this;

    const response = {};

    const dbRows = await oThis
      .select('*')
      .where(['lock_identifier = ?', lockIdentifier])
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response[formatDbRow.id] = formatDbRow;
    }

    return response;
  }

  /**
   * Mark status as processed successfully.
   *
   * @param hookId
   * @param serviceMessageId
   * @returns {Promise<void>}
   */
  async markStatusAsProcessed(hookId, serviceMessageId) {
    const oThis = this;

    await oThis
      .update({
        lock_identifier: null,
        locked_at: null,
        status: smsHookConstant.invertedStatuses[smsHookConstant.successStatus],
        service_message_id: serviceMessageId
      })
      .where(['id = ?', hookId])
      .fire();
  }

  /**
   * Mark hook as failed.
   *
   * @param {number} hookId
   * @param {number} failedCount
   * @param {object} failedLogs
   *
   * @returns {Promise<void>}
   */
  async markFailedToBeRetried(hookId, failedCount, failedLogs) {
    const oThis = this;

    logger.error(
      'Hook marked as failed. Hook id:',
      hookId,
      'failed count:',
      failedCount,
      '->',
      JSON.stringify(failedLogs)
    );

    await oThis
      .update({
        status: smsHookConstant.invertedStatuses[smsHookConstant.failedStatus],
        retry_count: failedCount + 1,
        lock_identifier: null,
        locked_at: null
      })
      .where(['id = ?', hookId])
      .fire();
  }

  /**
   * Mark hooks as ignored.
   *
   * @param {number} hookId
   * @param {number} failedCount
   * @param {object} failedLogs
   *
   * @returns {Promise<void>}
   */
  async markFailedToBeIgnored(hookId, failedCount, failedLogs) {
    const oThis = this;

    logger.error(
      'Hook marked as failed. Hook id:',
      hookId,
      'failed count:',
      failedCount,
      '->',
      JSON.stringify(failedLogs)
    );

    await oThis
      .update({
        status: smsHookConstant.invertedStatuses[smsHookConstant.ignoredStatus],
        retry_count: failedCount + 1,
        lock_identifier: null,
        locked_at: null
      })
      .where(['id = ?', hookId])
      .fire();
  }
}

module.exports = SmsHookModel;
