/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform'),
  chainConstants = require(rootPrefix + '/lib/globalConstant/chains');
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
   * @param {number} dbRow.id
   * @param {number} dbRow.user_id
   * @param {string} dbRow.platform
   * @param {string} dbRow.platform_id
   * @param {string} dbRow.platform_url
   * @param {number} dbRow.start_ts
   * @param {string} dbRow.image_id
   * @param {string} dbRow.ipfs_object_id
   * @param {number} dbRow.status
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   * @param {number} dbRow.total_whispers
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      userId: dbRow.user_id,
      platform: dbRow.platform,
      platformId: dbRow.platform_id,
      platformUrl: dbRow.platform_url,
      startTs: dbRow.start_ts,
      imageId: dbRow.image_id,
      ipfsObjectId: dbRow.ipfs_object_id,
      status: dbRow.status,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
      // TODO total_whispers - key should be in camecase
      total_whispers: dbRow.total_whispers
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

    const dbRows = await oThis
      .select([
        'id',
        'user_id',
        'platform',
        'platform_id',
        'platform_url',
        'start_ts',
        'image_id',
        'ipfs_object_id',
        'status',
        'created_at',
        'updated_at',
        'total_whispers'
      ])
      .where({ id: id })
      .fire();

    const response = [];

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis.formatDbData(dbRows[index]);
      response.push(formatDbRow);
    }

    console.log(response);

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
   * This method gets the chains data with pagination.
   *
   * @param {number} page
   * @param {number} limit
   * @param {string} platform
   *
   * @returns {Promise<void>}
   */
  async getActiveChainsDataWithPagination(page, limit, platform) {
    const oThis = this;
    const offset = (page - 1) * limit;
    const response = [];
    const dbRows = await oThis
      .select('*')
      .where({
        platform: platformConstants.invertedPlatforms[platform],
        status: chainConstants.invertedStatuses[chainConstants.activeStatus]
      })
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
   * This method gets the total wishpers on chain id.
   *
   * @param {number} id
   *
   * @returns {Promise<void>}
   */
  async getTotalWhisperById(id) {
    const oThis = this;
    const resp = await oThis.getById(id);
    const response = resp[0].total_whispers;

    return response;
  }
  /**
   * Fetch whisper info by status.
   *
   * @param {number} id
   *
   * @returns {Promise<{}>}
   */
  // TODO total_whispers - don't select before update.
  // UPDATE chains SET total_whispers = total_whispers + 1;
  async updateTotalWhispers(id) {
    const oThis = this;
    let whispers = await oThis.getTotalWhisperById(id);

    whispers = parseInt(whispers) + 1;
    //console.log(typeof whispers);
    const updatedResponse = await oThis
      .update({
        total_whispers: whispers
      })
      .where({ id: id })
      .fire();

    if (updatedResponse.affectedRows != 1) {
      return Promise.reject(
        responseHelper.error({
          internal_error_identifier: 'a_m_ms_m_c_utw_1',
          api_error_identifier: 'something_went_wrong',
          debug_options: {
            id: id
          }
        })
      );
    }
    //console.log('new whisper---------',await oThis.getTotalWhisperById(id));
    return;
  }

  /**
   * List of formatted column names that can be exposed by service.
   *
   * @returns {array}
   */
  safeFormattedColumnNames() {
    return [
      'id',
      'user_id',
      'platform',
      'platform_id',
      'platform_url',
      'start_ts',
      'image_id',
      'ipfs_object_id',
      'status',
      'created_at',
      'updated_at',
      'total_whispers'
    ];
  }
}

module.exports = ChainModel;
