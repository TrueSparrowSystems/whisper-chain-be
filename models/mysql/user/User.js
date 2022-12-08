/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  util = require(rootPrefix + '/lib/util'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  localCipher = require(rootPrefix + '/lib/encryptors/localCipher'),
  userConstants = require(rootPrefix + '/lib/globalConstant/user/user'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource');

// Declare variables names.
const dbName = databaseConstants.userDbName;

/**
 * Class for user model.
 *
 * @class UserModel
 */
class UserModel extends ModelBase {
  /**
   * Constructor for user model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'users';
  }

  /**
   * Bitwise config.
   *
   * @returns {object}
   */
  get bitwiseConfig() {
    return {
      properties: userConstants.properties
    };
  }

  /**
   * Format db data.
   *
   * @param {object} dbRow
   * @param {string} dbRow.id
   * @param {string} dbRow.email
   * @param {string} dbRow.name
   * @param {string} dbRow.password
   * @param {string} dbRow.cookie_token
   * @param {string} dbRow.encryption_salt
   * @param {string} dbRow.properties
   * @param {number} dbRow.status
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      email: dbRow.email,
      name: dbRow.name,
      password: dbRow.password,
      cookieToken: dbRow.cookie_token,
      encryptionSalt: dbRow.encryption_salt,
      properties: dbRow.properties,
      status: userConstants.statuses[dbRow.status],
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
    return ['id', 'name', 'properties', 'email', 'status', 'createdAt', 'updatedAt'];
  }

  /**
   * Is the test user property set here?
   *
   * @param {object} userObj
   *
   * @returns {boolean}
   */
  static testUserProperty(userObj) {
    const propertiesArray = new UserModel().getBitwiseArray('properties', userObj.properties);

    return propertiesArray.indexOf(userConstants.testUserProperty) > -1;
  }

  /**
   * Fetch user by ids.
   *
   * @param {array} ids
   *
   * @returns {object}
   */
  async fetchByIds(ids) {
    const oThis = this;

    const dbRows = await oThis
      .select('*')
      .where({
        id: ids
      })
      .fire();

    const response = {};

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);

      response[formatDbRow.id] = oThis.safeFormattedData(formatDbRow);
    }

    return response;
  }

  /**
   * Fetch secure user by id.
   *
   * @param {number} id: user id
   *
   * @returns {object}
   */
  async fetchSecureById(id) {
    const oThis = this;

    const dbRows = await oThis
      .select('*')
      .where(['id = ?', id])
      .fire();

    if (dbRows.length === 0) {
      return {};
    }

    return oThis.formatDbData(dbRows[0]);
  }

  /**
   * Fetch all active user ids with pagination.
   *
   * @param {object} params
   * @param {number} params.limit
   * @param {number} [params.paginationDatabaseId]
   *
   * @returns {Promise<{}>}
   */
  async fetchAllActiveUsersWithPagination(params) {
    const oThis = this;

    const userIds = [];

    let nextPageDatabaseId = null;

    const queryObj = oThis
      .select('id')
      .where({ status: userConstants.invertedStatuses[userConstants.activeStatus] })
      .limit(params.limit)
      .order_by('id asc');

    if (params.paginationDatabaseId) {
      queryObj.where(['id > ?', params.paginationDatabaseId]);
    }

    const dbRows = await queryObj.fire();

    for (let index = 0; index < dbRows.length; index++) {
      userIds.push(dbRows[index].id);
      nextPageDatabaseId = dbRows[index].id;
    }

    return {
      userIds: userIds,
      nextPageDatabaseId: nextPageDatabaseId
    };
  }

  /**
   * Get cookie token for different sources.
   *
   * @param {object} userObj
   * @param {string} decryptedEncryptionSalt
   * @param {object} options
   *
   * @returns {string}
   */
  getCookieToken(userObj, decryptedEncryptionSalt, options) {
    const uniqueStr = localCipher.decrypt(decryptedEncryptionSalt, userObj.cookieToken),
      source = options.apiSource;

    let strSecret = null;

    if (apiSourceConstants.isWebRequest(options.apiSource)) {
      strSecret = coreConstants.WEB_COOKIE_SECRET;
    } else if (apiSourceConstants.isAppRequest(options.apiSource)) {
      strSecret = coreConstants.A_COOKIE_TOKEN_SECRET;
    } else {
      throw new Error(`Invalid api_source-${options.apiSource} for getCookieToken`);
    }

    const stringToSign =
      source + ':' + userObj.id + ':' + options.timestamp + ':' + strSecret + ':' + uniqueStr.substring(0, 16);
    const salt = source + ':' + userObj.id + ':' + uniqueStr.slice(-16) + ':' + strSecret + ':' + options.timestamp;

    return util.createSha256Digest(salt, stringToSign);
  }

  /**
   * Get cookie value for different sources.
   *
   * @param {object} userObj
   * @param {string} decryptedEncryptionSalt
   * @param {object} options
   *
   * @returns {string}
   */
  getCookieValue(userObj, decryptedEncryptionSalt, options) {
    const oThis = this;

    const cookieToken = oThis.getCookieToken(userObj, decryptedEncryptionSalt, options),
      source = options.apiSource;

    if (!options.currentUserId) {
      throw new Error(`Invalid currentUserId-${options.currentUserId} for getCookieValue`);
    }

    if (apiSourceConstants.isWebRequest(options.apiSource)) {
      // DO Nothing.
    } else if (apiSourceConstants.isAppRequest(options.apiSource)) {
      // DO Nothing.
    } else {
      throw new Error(`Invalid api_source-${options.apiSource} for getCookieValue`);
    }

    return (
      cookieConstants.latestVersion +
      ':' +
      source +
      ':' +
      userObj.id +
      ':' +
      options.timestamp +
      ':' +
      cookieToken +
      ':' +
      options.currentUserId
    );
  }

  /**
   * Flush cache.
   *
   * @param {object} params
   * @param {number} [params.id]
   * @param {array<number>} [params.ids]
   *
   * @returns {Promise<*>}
   */
  static async flushCache(params) {
    let ids = [];
    if (params.ids) {
      ids = params.ids;
    } else if (params.id) {
      ids = [params.id];
    }

    const promisesArray = [];

    if (ids.length > 0) {
      const UsersByIdsCache = require(rootPrefix + '/lib/cacheManagement/multi/user/UsersByIds');
      promisesArray.push(new UsersByIdsCache({ ids: ids }).clear());
    }

    await Promise.all(promisesArray);
  }
}

module.exports = UserModel;
