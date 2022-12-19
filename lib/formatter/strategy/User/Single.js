const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for users formatter.
 *
 * @class UsersFormatter
 */
class UsersFormatter extends BaseFormatter {
  /**
   * Constructor for users formatter.
   *
   * @param {object} params
   * @param {integer} params.id
   * @param {integer} params.uts
   * @param {integer} params.platform
   * @param {integer} params.platformUserId
   * @param {integer} params.platformDisplayName
   * @param {integer} params.platformUsername
   * @param {string} params.platformProfileImageId
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
    oThis.platform = params.platform;
    oThis.platformUserId = params.platformUserId;
    oThis.platformDisplayName = params.platformDisplayName;
    oThis.platformUsername = params.platformUsername;
    oThis.platformProfileImageId = params.platformProfileImageId;
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
      platform: oThis.platform,
      platform_user_id: oThis.platformUserId,
      platform_display_name: oThis.platformDisplayName,
      platform_username: oThis.platformUsername,
      platform_profile_image_id: oThis.platformProfileImageId,
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
   * @returns {{type: object, properties: {id: {type: integer, example: number}, uts: {type: integer, example: number}, platform: {type: string, example: string}, platform_user_id: {type: integer, example: number}, platform_display_name: {type: string, example: string}, platform_username: {type: string, example: string}, platform_profile_image_id: { type: integer, example: number}, status: {type: string, example: string}}, required: [integer, integer, string, integer, string, string, integer, string]}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 123,
          description: 'BE notes: this is the id of users table'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        platform: {
          type: 'string',
          example: 'LENS'
        },
        platform_user_id: {
          type: 'integer',
          example: 1651666861
        },
        platform_display_name: {
          type: 'string',
          example: 'ABC'
        },
        platform_username: {
          type: 'string',
          example: 'User-ABC'
        },
        platform_profile_image_id: {
          type: 'integer',
          example: 1651666861
        },
        status: {
          type: 'string',
          example: 'ACTIVE'
        }
      },
      required: [
        'id',
        'uts',
        'platform',
        'platform_user_id',
        'platform_display_name',
        'platform_username',
        'platform_profile_image_id',
        'status'
      ]
    };
  }
}

module.exports = UsersFormatter;
