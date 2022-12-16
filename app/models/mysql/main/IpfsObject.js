console.log('Hello');
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  ipfsObjectConstants = require(rootPrefix + '/lib/globalConstant/ipfsObject');

// Declare variables names.
const dbName = databaseConstants.mainDbName;

/**
 * Class for user model.
 *
 * @class IpfsObjectsModel
 */
class IpfsObjectsModel extends ModelBase {
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

    oThis.tableName = 'ipfs_objects';
  }

  /**
   * Format db data.
   *
   * @param {object} dbRow
   * @param {string} dbRow.id
   * @param {string} dbRow.kind
   * @param {string} dbRow.cid
   * @param {number} dbRow.created_at
   * @param {number} dbRow.updated_at
   *
   * @returns {object}
   */
  formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      kind: ipfsObjectConstants.kinds[dbRow.kind],
      cid: dbRow.cid,
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
    return ['id', 'kind', 'cid', 'createdAt', 'updatedAt'];
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
   * Insert Corporate client.
   *
   * @param {object} params
   * @param {string} params.kind
   * @param {string} params.cid
   *
   * @returns {Promise<any>}
   */
  async insertIpfsObject(params) {
    const oThis = this;

    params.kind = ipfsObjectConstants.invertedKinds[params.kind];

    return oThis.insert(params).fire();
  }
}

module.exports = IpfsObjectsModel;
