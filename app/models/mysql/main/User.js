const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  localCipher = require(rootPrefix + '/lib/localCipher'),
  util = require(rootPrefix + '/lib/util'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  userConstants = require(rootPrefix + '/lib/globalConstant/user'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

// Declare variables names.
const dbName = databaseConstants.mainDbName;

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
   * Format db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {number} dbRow.platform
   * @param {string} dbRow.platform_user_id
   * @param {string} dbRow.platform_display_name
   * @param {string} dbRow.platform_username
   * @param {number} dbRow.platform_profile_image_id
   * @param {number} dbRow.kind
   * @param {string} dbRow.cookie_token
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
      platform: dbRow.platform,
      platformUserId: dbRow.platform_user_id,
      platformDisplayName: dbRow.platform_display_name,
      platformUsername: dbRow.platform_username,
      platformProfileImageId: dbRow.platform_profile_image_id,
      kind: userConstants.kinds[dbRow.kind],
      cookieToken: dbRow.cookie_token,
      status: userConstants.statuses[dbRow.status],
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * This method gets the response for the id passed.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   *
   * @returns {Promise<any>}
   */
  async getById(id) {
    const oThis = this;

    const dbRows = await oThis
      .select('*')
      .where({ id: id })
      .fire();

    const response = [];

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);

      response.push(formatDbRow);
    }

    return response;
  }

  /**
   * This method inserts an entry in the table.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {number} dbRow.platform
   * @param {string} dbRow.platform_user_id
   * @param {string} dbRow.platform_display_name
   * @param {string} dbRow.platform_username
   * @param {number} dbRow.platform_profile_image_id
   * @param {number} dbRow.kind
   * @param {string} dbRow.cookie_token
   * @param {number} dbRow.status
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @returns {Promise<*>}
   */
  async insertRecord(params) {
    const oThis = this;

    return oThis.insert(params).fire();
  }

  /**
   * This method gets the response for the array of ids passed.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @returns {Promise<void>}
   */
  async getByIds(ids) {
    const oThis = this;

    const response = {};

    const dbRows = await oThis
      .select('*')
      .where({ id: ids })
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response[formatDbRow.id] = formatDbRow;
    }

    return response;
  }

  /**
   * Fetch secure user by ids.
   *
   * @param {array} ids
   *
   * @returns {array}
   */
  async fetchByPlatformUserId(platformUserId) {
    const oThis = this;

    const dbRows = await oThis
      .select('*')
      .where({
        platform_user_id: platformUserId
      })
      .fire();

    const response = [];

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);

      response.push(formatDbRow);
    }

    return response;
  }

  /**
   * Get cookie value .
   *
   * @param {object} userObj
   * @param {string} decryptedEncryptionSalt
   * @param {object} options
   * @param {number} options.timestamp
   *
   * @returns {string}
   */
  getCookieValue(userObj, decryptedEncryptionSalt, options) {
    const oThis = this;

    const cookieToken = oThis.getCookieToken(userObj, decryptedEncryptionSalt, options);

    if (!userObj.id) {
      throw new Error(`Invalid userId-${userObj.id} for getCookieValue`);
    }

    return cookieConstants.latestVersion + ':' + userObj.id + ':' + options.timestamp + ':' + cookieToken;
  }

  /**
   * Get cookie token.
   *
   * @param {object} userObj
   * @param {string} decryptedEncryptionSalt
   * @param {object} options
   * @param {number} options.timestamp
   *
   * @returns {string}
   */
  getCookieToken(userObj, decryptedEncryptionSalt, options) {
    const decryptedCookieToken = localCipher.decrypt(decryptedEncryptionSalt, userObj.cookieToken);

    let strSecret = null;

    strSecret = coreConstants.API_COOKIE_SECRET;

    const stringToSign =
      userObj.id + ':' + options.timestamp + ':' + strSecret + ':' + decryptedCookieToken.substring(0, 16);
    const salt = userObj.id + ':' + decryptedCookieToken.slice(-16) + ':' + strSecret + ':' + options.timestamp;

    return util.createSha256Digest(salt, stringToSign);
  }
  /**
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return [
      'id',
      'platform',
      'platform_user_id',
      'platform_display_name',
      'platform_username',
      'platform_profile_image_id',
      'kind',
      'cookie_token',
      'status',
      'created_at',
      'updated_at'
    ];
  }
}

module.exports = UserModel;
