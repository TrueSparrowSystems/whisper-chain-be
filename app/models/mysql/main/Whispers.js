const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform');

// Declare variables.
const dbName = databaseConstants.mainDbName;

const has = Object.prototype.hasOwnProperty; // Cache the lookup once, in module scope.

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
   * This method gets the whispers for the chain_id passed.
   *
   * @param {number} chainId
   *
   * @returns {Promise<any>}
   */
  async getWhisperByChainId(chainId) {
    const oThis = this;

    const response = await oThis
      .select('*')
      .where({ chain_id: chainId })
      .order_by('created_at DESC')
      .fire();

    return response;
  }

  /**
   * This method gets the latest whispers with a limit for the chain_id passed.
   *
   * @param {number} chainId
   * @param {number} limit
   *
   * @returns {Promise<any>}
   */
  async getWhisperByChainIdWithLimit(chainId, limit) {
    const oThis = this;
    const response = await oThis
      .select('*')
      .where({ chain_id: chainId })
      .order_by('created_at DESC')
      .limit(limit)
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

  /**
   * This method inserts an entry in the table.
   *
   * @param {object} params
   * @param {number} params.user_id
   * @param {number} params.chain_id
   * @param {number} params.image_id
   * @param {string} params.platform
   * @param {string} params.platform_id
   * @param {number} params.ipfs_object_id
   * @param {string} params.status
   *
   * @returns {Promise<*>}
   */
  async insertRecord(params) {
    const oThis = this;

    // // Perform validations.
    // if (!has.call(params, 'user_id')
    // || !has.call(params, 'chain_id')
    // || !has.call(params, 'image_id')
    // || !has.call(params, 'platform')
    // || !has.call(params, 'platform_id')
    // || !has.call(params, 'ipfs_object_id')
    // || !has.call(params, 'status')
    // ) {
    //   throw new Error('Mandatory parameters are missing.');
    // }

    // if (typeof params.user_id != 'number'
    // || typeof params.chain_id != 'number'
    // || typeof params.image_id != 'number'
    // || typeof params.platform != 'string'
    // || typeof params.platform_id != 'number'
    // || typeof params.ipfs_object_id != 'number'
    // || typeof params.status != 'string'
    // ) {
    //   throw TypeError('Insertion parameters are of wrong params types.');
    // }

    params.platform = platformConstants.invertedPlatforms[params.platform];
    params.status = whispersConstants.invertedStatuses[params.status];

    return oThis.insert(params).fire();
  }
}

module.exports = WhispersModel;
