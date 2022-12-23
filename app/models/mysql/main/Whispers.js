const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  whispersConstants = require(rootPrefix + '/lib/globalConstant/whispers'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform');

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
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {number} dbRow.user_id
   * @param {number} dbRow.chain_id
   * @param {number} dbRow.image_id
   * @param {number} dbRow.platform
   * @param {string} dbRow.platform_id
   * @param {string} dbRow.platform_url
   * @param {number} dbRow.ipfs_object_id
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
      userId: dbRow.user_id,
      chainId: dbRow.chain_id,
      imageId: dbRow.image_id,
      platform: dbRow.platform,
      platformId: dbRow.platform_id,
      platformUrl: dbRow.platform_url,
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
   * This method gets the whispers data with pagination.
   *
   * @param {number} page
   * @param {number} limit
   * @param {number} chainId
   *
   * @returns {Promise<void>}
   */
  async getWhispersDataWithPagination(page, limit, chainId) {
    const oThis = this;
    const offset = (page - 1) * limit;
    const response = [];
    const dbRows = await oThis
      .select('*')
      .where({ chain_id: chainId })
      .where(['status NOT IN (?) ', [whispersConstants.inactiveStatus]])
      .order_by('created_at DESC')
      .limit(limit)
      .offset(offset)
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response.push(formatDbRow);
    }

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
    const response = [];
    const dbRows = await oThis
      .select('*')
      .where({ chain_id: chainId })
      .where(['status NOT IN (?) ', [whispersConstants.inactiveStatus]])
      .order_by('created_at DESC')
      .limit(limit)
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response.push(formatDbRow);
    }

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

  /**
   * Fetch whisper info by chain id.
   *
   * @param {number} chainId
   *
   * @returns {Promise<{}>}
   */
  async fetchByChainId(chainId) {
    const oThis = this;

    const dbRows = await oThis
      .select('id, user_id, image_id, platform, platform_id, platform_url, ipfs_object_id, status, updated_at')
      .where({
        chain_id: chainId
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
   * Fetch whisper info by status.
   *
   * @param {string} status
   *
   * @returns {Promise<{}>}
   */
  async fetchWhispersByStatus(status) {
    const oThis = this;

    const dbRows = await oThis
      .select('id, user_id, image_id, platform, platform_id, platform_url, ipfs_object_id, status, updated_at')
      .where({
        status: whispersConstants.invertedStatuses[status]
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
   * Fetch whisper info by status.
   *
   * @param {number} id
   * @param {string} platformId
   * @param {string} platformUrl
   *
   * @returns {Promise<{}>}
   */
  async updateProcessingWhisper(id, platformId, platformUrl) {
    const oThis = this;

    const updatedResponse = await oThis
      .update({
        status: whispersConstants.activeStatus,
        platformId: platformId,
        platformUrl: platformUrl
      })
      .where({ id: id })
      .fire();

    if (updatedResponse.affectedRows != 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_m_ms_m_w_upw_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            id: id,
            platformId: platformId
          }
        })
      );
    }

    return;
  }
}

module.exports = WhispersModel;
