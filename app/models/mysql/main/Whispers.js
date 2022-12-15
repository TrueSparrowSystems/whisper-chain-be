const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/big/whispers');

// Declare variables.
const dbName = databaseConstants.mainDbName;

/**
 * Class for whispers model.
 *
 * @class WhispersModel
 */
class WhispersModel extends ModelBase {
  /**
   * Constructor for whispers model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'whispers';
  }

  /**
   * Format Db data.
   *
   * @param {object} params
   * @param {number} params.id
   * @param {number} params.user_id
   * @param {number} params.chain_id
   * @param {number} params.image_id
   * @param {number} params.platform
   * @param {string} params.platform_id
   * @param {string} params.platform_url
   * @param {number} params.ipfs_object_id
   * @param {number} params.status
   * @param {number} params.created_at
   * @param {number} params.updated_at
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: params.id,
      userId: params.user_id,
      chainId: params.chain_id,
      imageId: params.image_id,
      platform: params.platform,
      platformId: params.platform_id,
      platformUrl: params.platform_url,
      ipfsObjectId: params.ipfs_object_id,
      status: params.status,
      createdAt: params.created_at,
      updatedAt: params.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * This method gets the response for the id passed.
   *
   * @param {number} id
   *
   * @returns {Promise<any>}
   */
  async getById(id) {
    const oThis = this;

    const response = await oThis
      .select('*')
      .where({ id: id })
      .fire();

    return response;
  }

  /**
   * This method gets the response for the array of ids passed.
   *
   * @param {array} ids
   *
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
}

module.exports = WhispersModel;
