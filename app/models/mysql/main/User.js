const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database');

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
      kind: dbRow.kind,
      cookieToken: dbRow.cookie_token,
      status: dbRow.status,
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

    const response = await oThis
      .select(['id', 'platform', 'platform_user_id', 'platform_display_name', 'platform_username', 'platform_profile_image_id', 'kind', 'cookie_token', 'status','created_at','updated_at'])
      .where({ id: id })
      .fire();

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
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return ['id', 'platform', 'platform_user_id', 'platform_display_name', 'platform_username', 'platform_profile_image_id', 'kind', 'cookie_token', 'status','created_at','updated_at'];
  }
}

module.exports = UserModel;
