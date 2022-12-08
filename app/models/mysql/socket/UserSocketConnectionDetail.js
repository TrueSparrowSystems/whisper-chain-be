const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  socketConnectionConstants = require(rootPrefix + '/lib/globalConstant/socket/socketConnection');

// Declare variables.
const dbName = databaseConstants.socketDbName;

/**
 * Class for user socket connection detail model.
 *
 * @class UserSocketConnectionDetailModel
 */
class UserSocketConnectionDetailModel extends ModelBase {
  /**
   * Constructor for user socket connection detail model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'user_socket_connection_details';
  }

  /**
   * Format Db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {number} dbRow.user_id
   * @param {string} dbRow.auth_key
   * @param {number} dbRow.auth_key_expiry_at
   * @param {number} dbRow.socket_identifier
   * @param {number} dbRow.status
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @return {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      userId: dbRow.user_id,
      authKey: dbRow.auth_key,
      authKeyExpiryAt: dbRow.auth_key_expiry_at,
      socketIdentifier: dbRow.socket_identifier,
      status: socketConnectionConstants.statuses[dbRow.status],
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return ['id', 'userId', 'authKey', 'authKeyExpiryAt', 'socketIdentifier', 'status', 'createdAt', 'updatedAt'];
  }

  /**
   * Fetch user socket connection details object for given ids.
   *
   * @param {array<string>} ids
   *
   * @return {object}
   */
  async fetchByIds(ids) {
    const oThis = this;

    const response = {};

    const dbRows = await oThis
      .select('*')
      .where(['id IN (?)', ids])
      .fire();

    for (let index = 0; index < ids.length; index++) {
      response[ids[index]] = {};
    }

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response[formatDbRow.id] = formatDbRow;
    }

    return response;
  }

  /**
   * Fetch active user socket connection details object for given userIds.
   *
   * @param {array<string>} userIds: user ids
   *
   * @return {object}
   */
  async fetchActiveByUserIds(userIds) {
    const oThis = this;

    const response = {};

    const dbRows = await oThis
      .select('*')
      .where([
        'user_id IN (?) AND status = ?',
        userIds,
        socketConnectionConstants.invertedStatuses[socketConnectionConstants.connectedStatus]
      ])
      .order_by('id asc')
      .fire();

    for (let ui = 0; ui < userIds.length; ui++) {
      response[userIds[ui]] = [];
    }

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response[formatDbRow.userId].push(formatDbRow);
    }

    return response;
  }

  /**
   * Mark socket connection details as expired.
   *
   * @param {array<number>} userSocketConnDetailsIds
   * @param {array<number>} userIds
   *
   * @returns {Promise<void>}
   * @private
   */
  async _markSocketConnectionDetailsAsExpired(userSocketConnDetailsIds, userIds) {
    const oThis = this;

    await oThis
      .update({
        status: socketConnectionConstants.invertedStatuses[socketConnectionConstants.expiredStatus]
      })
      .where({
        id: userSocketConnDetailsIds
      })
      .fire();

    await UserSocketConnectionDetailModel.flushCache({ ids: userSocketConnDetailsIds, userIds: userIds });
  }

  /**
   * Flush cache.
   *
   * @param {object} params
   * @param {number} params.id
   * @param {array<number>} params.ids
   * @param {number} params.userId
   * @param {array<number>} params.userIds
   *
   * @returns {Promise<*>}
   */
  static async flushCache(params) {
    let userIds = [],
      ids = [];

    if (params.ids) {
      ids = params.ids;
    }
    if (params.id) {
      ids = [params.id];
    }

    if (params.userIds) {
      userIds = params.userIds;
    }
    if (params.userId) {
      userIds = [params.userId];
    }

    const UserSocketConnectionDetailsByIdsCache = require(rootPrefix +
      '/lib/cacheManagement/multi/socket/UserSocketConnectionDetailsByIds');

    await new UserSocketConnectionDetailsByIdsCache({ ids: ids }).clear();

    const ActiveUserSocketConnectionDetailsByUserIdsCache = require(rootPrefix +
      '/lib/cacheManagement/multi/socket/ActiveUserSocketConnectionDetailsByUserIds');

    await new ActiveUserSocketConnectionDetailsByUserIdsCache({ userIds: userIds }).clear();
  }
}

module.exports = UserSocketConnectionDetailModel;
