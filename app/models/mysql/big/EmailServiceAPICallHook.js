const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook');

const dbName = databaseConstants.bigDbName;

/**
 * Class for email service api call hook model.
 *
 * @class EmailServiceAPICallHookModel
 */
class EmailServiceAPICallHookModel extends ModelBase {
  /**
   * Constructor for email service api call hook model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'email_service_api_call_hooks';
  }

  /**
   * Format Db data.
   *
   * @param {object} dbRow
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      receiverEntityId: dbRow.receiver_entity_id,
      receiverEntityKind: dbRow.receiver_entity_kind,
      eventType: emailServiceApiCallHookConstants.eventKinds[dbRow.event_type],
      customDescription: dbRow.custom_description,
      executionTimestamp: dbRow.execution_timestamp,
      lockIdentifier: dbRow.lock_identifier,
      lockedAt: dbRow.locked_at,
      status: emailServiceApiCallHookConstants.statuses[dbRow.status],
      failedCount: dbRow.failed_count,
      params: JSON.parse(dbRow.params),
      successResponse: JSON.parse(dbRow.success_response),
      failedResponse: JSON.parse(dbRow.failed_response),
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

    return oThis
      .update({
        lock_identifier: lockIdentifier,
        locked_at: Math.round(Date.now() / 1000)
      })
      .where('lock_identifier IS NULL')
      .where(['execution_timestamp < ?', Math.round(Date.now() / 1000)])
      .where([
        'status = ?',
        emailServiceApiCallHookConstants.invertedStatuses[emailServiceApiCallHookConstants.pendingStatus]
      ])
      .limit(emailServiceApiCallHookConstants.batchSizeForHooksProcessor)
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

    return oThis
      .update({
        lock_identifier: lockIdentifier,
        locked_at: Math.round(Date.now() / 1000)
      })
      .where('lock_identifier IS NULL')
      .where(['failed_count <= ?', emailServiceApiCallHookConstants.retryLimitForFailedHooks])
      .where([
        'status = ?',
        emailServiceApiCallHookConstants.invertedStatuses[emailServiceApiCallHookConstants.failedStatus]
      ])
      .limit(emailServiceApiCallHookConstants.batchSizeForHooksProcessor)
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
   * Mark status as processed.
   *
   * @param {number} hookId
   * @param {object} successResponse
   *
   * @returns {Promise<void>}
   */
  async markStatusAsProcessed(hookId, successResponse) {
    const oThis = this;

    await oThis
      .update({
        lock_identifier: null,
        locked_at: null,
        success_response: JSON.stringify(successResponse),
        status: emailServiceApiCallHookConstants.invertedStatuses[emailServiceApiCallHookConstants.processedStatus]
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

    await oThis
      .update({
        status: emailServiceApiCallHookConstants.invertedStatuses[emailServiceApiCallHookConstants.failedStatus],
        failed_count: failedCount + 1,
        lock_identifier: null,
        locked_at: null,
        failed_response: JSON.stringify(failedLogs)
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

    await oThis
      .update({
        status: emailServiceApiCallHookConstants.invertedStatuses[emailServiceApiCallHookConstants.ignoredStatus],
        failed_count: failedCount + 1,
        lock_identifier: null,
        locked_at: null,
        failed_response: JSON.stringify(failedLogs)
      })
      .where(['id = ?', hookId])
      .fire();
  }
}

module.exports = EmailServiceAPICallHookModel;
