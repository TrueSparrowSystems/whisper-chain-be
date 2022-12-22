const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database'),
  userEthAddressesConstants = require(rootPrefix + '/lib/globalConstant/userEthAddresses'),
  platformConstants = require(rootPrefix + '/lib/globalConstant/platform');

// Declare variables.
const dbName = databaseConstants.mainDbName;

/**
 * Class for user eth addresses model.
 *
 * @class UserEthAddressesModel
 */
class UserEthAddressesModel extends ModelBase {
  /**
   * Constructor for user eth addresses model.
   *
   * @augments ModelBase
   *
   * @constructor
   */
  constructor() {
    super({ dbName: dbName });

    const oThis = this;

    oThis.tableName = 'user_eth_addresses';
  }

  /**
   * Format Db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {number} dbRow.user_id
   * @param {string} dbRow.eth_address
   * @param {string} dbRow.platform
   * @param {string} dbRow.eth_address_kind
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
      ethAddress: dbRow.eth_address,
      platform: dbRow.platform,
      ethAddressKind: dbRow.eth_address_kind,
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
   * @param {string} params.eth_address
   * @param {string} params.platform
   * @param {string} params.eth_address_kind
   *
   * @returns {Promise<*>}
   */
  async insertRecord(params) {
    const oThis = this;

    return oThis.insert(params).fire();
  }
}

module.exports = UserEthAddressesModel;
