/**
 * DISCLAIMER: This file is part of example api in boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../..',
  BaseMetaFormatter = require(rootPrefix + '/lib/formatter/meta/Base');

/**
 * Class for all users list meta formatter.
 *
 * @class GetAllUsersListMeta
 */
class GetAllUsersListMeta extends BaseMetaFormatter {
  /**
   * Append service specific keys in meta.
   *
   * @param {object} meta
   *
   * @private
   */
  _appendSpecificMetaData(meta) {
    const oThis = this;

    return oThis._checkForExtraDataInMeta(meta);
  }

  _checkForExtraDataInMeta(meta) {
    const oThis = this;

    return meta;
  }

  static schema() {
    return {
      type: 'object'
    };
  }
}

module.exports = GetAllUsersListMeta;
