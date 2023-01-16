const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  platformChainSeedsConstants = require(rootPrefix + '/lib/globalConstant/platformChainSeeds'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform');

// Declare variables.
const dbName = databaseConstants.mainDbName;

/**
 * Class for platform chain seeds model.
 *
 * @class PlatformChainSeedsModel
 */
class PlatformChainSeedsModel extends ModelBase {
  /**
   * Constructor for platform chain seeds model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'platform_chain_seeds';
  }

  /**
   * Format Db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {string} dbRow.platform
   * @param {number} dbRow.start_ts
   * @param {number} dbRow.image_id
   * @param {string} dbRow.is_published
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      platform: platformConstants.platforms[dbRow.platform],
      startTs: dbRow.start_ts,
      imageId: dbRow.image_id,
      isPublished: platformChainSeedsConstants.publicationStatus[dbRow.is_published],
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

    const dbRows = await oThis
      .select('*')
      .where({ id: id })
      .fire();

    const response = [];

    const formatDbRow = oThis.formatDbData(dbRows[0]);
    response.push(formatDbRow);

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
   * This method gets the response for the id passed.
   *
   * @param {string} publicationStatus
   *
   * @returns {Promise<any>}
   */
  async fetchPlatformChainSeedsByPublicationStatus(publicationStatus) {
    const oThis = this;

    const dbRows = await oThis
      .select('*')
      .where({
        is_published: platformChainSeedsConstants.invertedPublicationStatus[publicationStatus]
      })
      .order_by('created_at ASC')
      .limit(1)
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
   * @param {object} params
   * @param {string} params.platform
   * @param {number} params.start_ts
   * @param {number} params.image_id
   * @param {string} params.is_published
   *
   * @returns {Promise<*>}
   */
  async insertRecord(params) {
    const oThis = this;

    return oThis.insert(params).fire();
  }

  /**
   * Update an entry in the table.
   *
   * @param {number} id
   * @param {string} publicationStatus
   * @param {string} platform
   *
   * @returns {Promise<{}>}
   */
  async updatePublicationStatusById(id, publicationStatus, platform) {
    const oThis = this;

    const updatedResponse = await oThis
      .update({
        platform: platform,
        is_published: platformChainSeedsConstants.invertedPublicationStatus[publicationStatus],
        start_ts: Date.now() / 1000
      })
      .where({ id: id })
      .fire();

    return updatedResponse;
  }
}

module.exports = PlatformChainSeedsModel;
