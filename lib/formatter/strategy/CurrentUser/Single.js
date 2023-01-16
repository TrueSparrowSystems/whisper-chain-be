const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for current user formatter.
 *
 * @class CurrentUserFormatter
 */
class CurrentUserFormatter extends BaseFormatter {
  /**
   * Constructor for current user formatter.
   *
   * @param {object} params
   * @param {object} params.currentUser
   * @param {number} params.currentUser.id
   * @param {number} params.currentUser.uts
   * @param {number} params.currentUser.userId
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.currentUser = params[entityTypeConstants.currentUser];
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
   * Format the input object.
   *
   * @returns {*|result}
   * @private
   */
  _format() {
    const oThis = this;

    return responseHelper.successWithData({
      id: oThis.currentUser.id,
      uts: oThis.currentUser.uts,
      is_first_time_user: oThis.currentUser.isFirstTimeUser || false,
      userId: oThis.currentUser.userId
    });
  }

  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
          description: 'BE notes: this is the id of users table'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        is_first_time_user: {
          type: 'boolean',
          example: false
        },
        userId: {
          type: 'integer',
          example: '1',
          description: 'BE notes: this is the id of users table'
        }
      },
      required: ['id', 'uts', 'userId']
    };
  }
}

module.exports = CurrentUserFormatter;
