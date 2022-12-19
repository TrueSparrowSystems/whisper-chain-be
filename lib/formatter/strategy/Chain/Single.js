const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for chains formatter.
 *
 * @class ChainsFormatter
 */
class ChainsFormatter extends BaseFormatter {
  /**
   * Constructor for chains formatter.
   *
   * @param {object} params
   * @param {integer} params.id
   * @param {integer} params.uts
   * @param {integer} params.ipfsObjectId
   * @param {integer} params.recentWhisperIds
   * @param {integer} params.startTs
   * @param {integer} params.imageId
   * @param {string} params.platform
   * @param {string} params.platformChainId
   * @param {string} params.platformChainUrl
   * @param {string} params.status
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.id = params.id;
    oThis.uts = params.uts;
    oThis.ipfsObjectId = params.ipfsObjectId;
    oThis.recentWhisperIds = params.recentWhisperIds;
    oThis.startTs = params.startTs;
    oThis.imageId = params.imageId;
    oThis.platform = params.platform;
    oThis.platformChainId = params.platformChainId;
    oThis.platformChainUrl = params.platformChainUrl;
    oThis.status = params.status;
  }

  /**
   * Format the input object.
   *
   * @returns {*|result}
   * @private
   */
  _format() {
    const oThis = this;

    return responseHelper.successWithData({
      id: oThis.id,
      uts: oThis.uts,
      ipfs_object_id: oThis.ipfsObjectId,
      recent_whisper_ids: oThis.recentWhisperIds,
      start_ts: oThis.startTs,
      image_id: oThis.imageId,
      platform: oThis.platform,
      platform_chain_id: oThis.platformChainId,
      platform_chain_url: oThis.platformChainUrl,
      status: oThis.status
    });
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    const oThis = this;

    return oThis._validateSingle(formattedEntity);
  }

  /**
   * Schema
   *
   * @returns {{type: object, properties: {id: {type: integer, example: number}, uts: {type: integer, example: number}, ipfs_object_id: {type: integer, example: number},recent_whisper_ids: {type: array, example: array}, start_ts: {type: integer, example: number}, image_id: { type: integer, example: number}, platform_chain_id: {type: string, example: string}, platform_chain_url: {type: string, example: string}, platform: {type: string, example: string}, status: {type: string, example: string}}, required: [integer, string, integer]}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 123,
          description: 'BE notes: this is the id of chains table'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        ipfs_object_id: {
          type: 'integer',
          example: 10000001,
          description: 'BE notes: this is the id of ipfs_objects table'
        },
        recent_whisper_ids: {
          type: 'array',
          example: [10000001, 10000002]
        },
        start_ts: {
          type: 'integer',
          example: 1651666861
        },
        image_id: {
          type: 'integer',
          example: 100000001,
          description: 'BE notes: this is the id of images table'
        },
        platform: {
          type: 'string',
          example: 'LENS'
        },
        platform_chain_id: {
          type: 'string',
          example: '0x55cf-0x05'
        },
        platform_chain_url: {
          type: 'string',
          example: 'https://testnet.lenster.xyz/posts/0x55cf-0x05'
        },
        status: {
          type: 'string',
          example: 'ACTIVE'
        }
      },
      required: [
        'id',
        'uts',
        'ipfs_object_id',
        'recent_whisper_ids',
        'start_ts',
        'image_id',
        'platform',
        'platform_chain_id',
        'platform_chain_url',
        'status'
      ]
    };
  }
}

module.exports = ChainsFormatter;
