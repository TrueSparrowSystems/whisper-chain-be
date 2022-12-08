/* eslint-disable id-length */
const rootPrefix = '../../../..',
  ModelBase = require(rootPrefix + '/app/models/mysql/Base'),
  shortToLongUrl = require(rootPrefix + '/lib/shortToLongUrl'),
  imageConstants = require(rootPrefix + '/lib/globalConstant/entity/image'),
  databaseConstants = require(rootPrefix + '/lib/globalConstant/database');

const dbName = databaseConstants.entityDbName;

/**
 * Class for image model.
 *
 * @class Image
 */
class Image extends ModelBase {
  /**
   * Constructor for image model.
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
   * Format Db data.
   *
   * @param {object} dbRow
   * @param {number} dbRow.id
   * @param {string} dbRow.url_template
   * @param {string} dbRow.resolutions
   * @param {number} dbRow.status
   * @param {number} dbRow.resize_status
   * @param {number} dbRow.kind
   * @param {string} dbRow.created_at
   * @param {string} dbRow.updated_at
   *
   * @returns {object}
   * @private
   */
  _formatDbData(dbRow) {
    const oThis = this;

    const formattedData = {
      id: dbRow.id,
      urlTemplate: dbRow.url_template,
      resolutions: JSON.parse(dbRow.resolutions),
      status: imageConstants.statuses[dbRow.status],
      resizeStatus: imageConstants.resizeStatuses[dbRow.resize_status],
      kind: imageConstants.kinds[dbRow.kind],
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * Fetch images for given ids
   *
   * @param {array} ids: image ids
   *
   * @returns {object}
   */
  async fetchImagesByIds(ids) {
    const oThis = this;

    const response = {};

    const dbRows = await oThis
      .select('*')
      .where(['id IN (?)', ids])
      .fire();

    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = oThis._formatDbData(dbRows[index]);
      formatDbRow.resolutions = oThis._formatResolutions(formatDbRow.resolutions, formatDbRow.urlTemplate);
      response[formatDbRow.id] = formatDbRow;
    }

    return response;
  }

  /**
   * Formats the complete resolution hash.
   *
   * @param {object} resolutions
   * @param {string} urlTemplate
   *
   * @returns {object}
   * @private
   */
  _formatResolutions(resolutions, urlTemplate) {
    const oThis = this;

    const responseResolutionHash = {};
    for (const resolution in resolutions) {
      const longResolutionKey = imageConstants.invertedResolutionKeyToShortMap[resolution];

      responseResolutionHash[longResolutionKey] = oThis._formatResolution(resolutions[resolution]);

      const longResolutionSize = longResolutionKey === imageConstants.originalResolution ? '' : longResolutionKey;
      responseResolutionHash[longResolutionKey].url = shortToLongUrl.getFullUrl(urlTemplate, longResolutionSize);
    }

    return responseResolutionHash;
  }

  /**
   * Format resolutions hash.
   *
   * @param {object} resolution
   *
   * @returns {object}
   * @private
   */
  _formatResolution(resolution) {
    const oThis = this;

    const formattedData = {
      url: resolution.u,
      size: resolution.s,
      height: resolution.h,
      width: resolution.w
    };

    return oThis.sanitizeFormattedData(formattedData);
  }

  /**
   * Insert into images.
   *
   * @param {object} params
   * @param {string} params.urlTemplate
   * @param {string} params.resolutions
   * @param {number} params.kind
   * @param {string} params.resizeStatus
   *
   * @returns {object}
   */
  async insertImage(params) {
    const oThis = this;

    const resolutions = oThis._formatResolutionsToInsert(params.resolutions);

    return oThis
      .insert({
        url_template: params.urlTemplate,
        resolutions: JSON.stringify(resolutions),
        kind: imageConstants.invertedKinds[params.kind],
        status: imageConstants.invertedStatuses[imageConstants.activeStatus],
        resize_status: imageConstants.invertedResizeStatuses[params.resizeStatus]
      })
      .fire();
  }

  /**
   * Update image.
   *
   * @param {object} params
   * @param {string} params.urlTemplate
   * @param {string} params.resolutions
   * @param {string} params.resizeStatus
   * @param {number} params.id
   *
   * @returns {object}
   */
  async updateImage(params) {
    const oThis = this;

    console.log('JSON.stringify(params) from updateImage', JSON.stringify(params));

    const resolutions = oThis._formatResolutionsToUpdate(params.resolutions);

    return oThis
      .update({
        url_template: params.urlTemplate,
        resolutions: JSON.stringify(resolutions),
        resize_status: imageConstants.invertedResizeStatuses[params.resizeStatus]
      })
      .where({ id: params.id })
      .fire();
  }

  /**
   * Format resolutions to insert.
   *
   * @param {object} resolutions
   *
   * @returns {object}
   * @private
   */
  _formatResolutionsToInsert(resolutions) {
    const oThis = this;

    const responseResolutionHash = {};
    for (const resolution in resolutions) {
      const shortResolutionKey = imageConstants.resolutionKeyToShortMap[resolution];

      responseResolutionHash[shortResolutionKey] = oThis._formatResolutionToInsert(resolutions[resolution]);
    }

    return responseResolutionHash;
  }

  /**
   * Format resolutions to update.
   *
   * @param {object} resolutions
   * @private
   */
  _formatResolutionsToUpdate(resolutions) {
    const oThis = this;

    const responseResolutionHash = {};
    for (const resolution in resolutions) {
      const shortResolutionKey = imageConstants.resolutionKeyToShortMap[resolution];
      responseResolutionHash[shortResolutionKey] = responseResolutionHash[shortResolutionKey] || {};
      Object.assign(
        responseResolutionHash[shortResolutionKey],
        oThis._formatResolutionToInsert(resolutions[resolution])
      );
    }

    return responseResolutionHash;
  }

  /**
   * Format resolution to insert
   *
   * @param {object} resolution
   *
   * @returns {object}
   * @private
   */
  _formatResolutionToInsert(resolution) {
    const oThis = this;

    const formattedData = {
      s: resolution.size,
      h: resolution.height,
      w: resolution.width
    };

    return oThis.sanitizeFormattedData(formattedData);
  }
}

module.exports = Image;
