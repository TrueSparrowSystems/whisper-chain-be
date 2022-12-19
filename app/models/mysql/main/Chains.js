/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database');

// Declare variables names.
const dbName = databaseConstants.mainDbName;

/**
 * Class for chain model.
 *
 * @class ChainModel
 */
class ChainModel extends ModelBase {
  /**
   * Constructor for chain model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'chains';
  }

  /**
   * Format db data.
   *
   * @param {object} dbRow
   * @param {object} dbRow.id
   * @param {string} dbRow.platform
   * @param {string} dbRow.platform_id
   * @param {string} dbRow.platform_url
   * @param {number} dbRow.start_ts
   * @param {string} dbRow.image_id
   * @param {string} dbRow.ipfs_object_id
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
      platformId: dbRow.platform_id,
      platformUrl: dbRow.platform_url,
      startTs: dbRow.start_ts,
      imageId: dbRow.image_id,
      ipfsObjectId: dbRow.ipfs_object_id,
      status: dbRow.status,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * This method gets the response for the id passed.
   *
   * @param {string} id
   *
   * @returns {Promise<any>}
   */
  async getById(id) {
    const oThis = this;

    const response = await oThis
      .select([
        'id',
        'platform',
        'platform_id',
        'platform_url',
        'start_ts',
        'image_id',
        'ipfs_object_id',
        'status',
        'created_at',
        'updated_at'
      ])
      .where({ id: id })
      .fire();

    return response;
  }

  /**
   * This method inserts an entry in the table.
   *
   * @param {object} params
   * @param {string} params.url
   * @param {number} params.ipfs_object_id
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

  /**
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return [
      'id',
      'platform',
      'platform_id',
      'platform_url',
      'start_ts',
      'image_id',
      'ipfs_object_id',
      'status',
      'created_at',
      'updated_at'
    ];
  }
}

module.exports = ChainModel;
