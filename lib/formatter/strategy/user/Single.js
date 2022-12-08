const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for user formatter.
 *
 * @class UserFormatter
 */
class UserFormatter extends BaseFormatter {
  /**
   * Constructor for user formatter.
   *
   * @param {object} params
   * @param {integer} params.userId
   * @param {object} params.user
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.userId = params.userId;
    oThis.user = params.user;
  }

  /**
   * Format the input object.
   *
   * @returns {*|result}
   * @private
   */
  _format() {
    const oThis = this;

    const userId = Number(oThis.user.id);

    return responseHelper.successWithData({
      id: userId,
      user_id: userId,
      email: oThis.user.email,
      name: oThis.user.name,
      status: oThis.user.status,
      uts: Number(oThis.user.updatedAt)
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
   * @returns {{type: string, properties: {uts: {type: string, example: number}, name: {type: string, example: string}, id: {description: string, type: string, example: number}, email: {type: string, example: string}, status: {type: string, example: string}}, required: [string, string, string, string]}}
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
        email: {
          type: 'string',
          example: 'david@example.com'
        },
        name: {
          type: 'string',
          example: 'David'
        },
        status: {
          type: 'string',
          example: 'ACTIVE'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        }
      },
      required: ['id', 'email', 'status', 'uts']
    };
  }
}

module.exports = UserFormatter;
