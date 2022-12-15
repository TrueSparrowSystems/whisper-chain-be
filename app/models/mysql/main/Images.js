/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database');

// Declare variables names.
const dbName = databaseConstants.mainDbName;

const has = Object.prototype.hasOwnProperty; // Cache the lookup once, in module scope.

/**
 * Class for image model.
 *
 * @class ImageModel
 */
class ImageModel extends ModelBase {
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

    oThis.tableName = 'images';
  }

  /**
   * Format db data.
   *
   * @param {object} dbRow
   * @param {string} dbRow.id
   * @param {string} dbRow.url
   * @param {string} dbRow.ipfs_object_id
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      url: dbRow.url,
      ipfsObjectId: dbRow.ipfs_object_id,
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
      .select(['id', 'url', 'ipfs_object_id', 'created_at', 'updated_at'])
      .where({ id: id })
      .fire();

    return response;
  }

  /**
   * This method inserts an entry in the table.
   *
   * @param {object} params
   * @param {string} params.url
   * @param {string} params.ipfs_object_id
   *
   * @returns {Promise<*>}
   */
  async insertRecord(params) {
    const oThis = this;

    // Perform validations.
    // if (!has.call(params, 'url') || !has.call(params, 'ipfs_object_id')) {
    //   throw new Error('Mandatory parameters are missing.');
    // }

    // if (typeof params.url !== 'string' || typeof params.ipfs_object_id !== 'integer') {
    //   throw TypeError('Insertion parameters are of wrong params types.');
    // }

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
    return ['id', 'url', 'ipfsObjectId', 'createdAt', 'updatedAt'];
  }
}

module.exports = ImageModel;
