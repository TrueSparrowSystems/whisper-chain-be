const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for Whispers formatter.
 *
 * @class WhispersFormatter
 */
class WhispersFormatter extends BaseFormatter {
  /**
   * Constructor for Whispers formatter.
   *
   * @param {object} params
   * @param {integer} params.id
   * @param {integer} params.imageId
   * @param {integer} params.userId
   * @param {integer} params.ipfsObjectId
   * @param {integer} params.uts
   * @param {string} params.platformChainId
   * @param {string} params.platformChainUrl
   * @param {integer} params.chainId
   * @param {string} params.platform
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
    oThis.imageId = params.imageId;
    oThis.userId = params.userId;
    oThis.ipfsObjectId = params.ipfsObjectId;
    oThis.uts = params.uts;
    oThis.platformChainId = params.platformChainId;
    oThis.platformChainUrl = params.platformChainUrl;
    oThis.chainId = params.chainId;
    oThis.platform = params.platform;
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
      image_id: oThis.imageId,
      user_id: oThis.userId,
      ipfs_object_id: oThis.ipfsObjectId,
      uts: oThis.uts,
      platform_chain_id: oThis.platformChainId,
      platform_chain_url: oThis.platformChainUrl,
      chain_id: oThis.chainId,
      platform: oThis.platform,
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
   * @returns {{type: object, properties: {id: {type: integer, example: number}, image_id: {type: integer, example: number}, user_id: {type: integer, example: number},ipfs_object_id: {type: integer, example: number}, uts: {type: integer, example: number}, platform_chain_id: {type: string, example: string}, platform_chain_url: {type: string, example: string}, chain_id: { type: integer, example: number}, platform: {type: string, example: string}, status: {type: string, example: string}}, required: [integer, string, integer]}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 123,
          description: 'BE notes: this is the id of whispers table'
        },
        image_id: {
          type: 'integer',
          example: 10000001,
          description: 'BE notes: this is the id of images table'
        },
        user_id: {
          type: 'integer',
          example: 10000001,
          description: 'BE notes: this is the id of users table'
        },
        ipfs_object_id: {
          type: 'integer',
          example: 10000001,
          description: 'BE notes: this is the id of ipfs_objects table'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        platform_chain_id: {
          type: 'string',
          example: '0x55cf-0x05'
        },
        platform_chain_url: {
          type: 'string',
          example: 123,
          description: 'https://testnet.lenster.xyz/posts/0x55cf-0x05'
        },
        chain_id: {
          type: 'integer',
          example: 10000001,
          description: 'BE notes: this is the id of chains table'
        },
        platform: {
          type: 'string',
          example: 'LENS'
        },
        status: {
          type: 'string',
          example: 'ACTIVE'
        }
      },
      required: [
        'id',
        'image_id',
        'user_id',
        'ipfs_object_id',
        'uts',
        'platform_chain_id',
        'platform_chain_url',
        'chain_id',
        'platform',
        'status'
      ]
    };
  }
}

module.exports = WhispersFormatter;
