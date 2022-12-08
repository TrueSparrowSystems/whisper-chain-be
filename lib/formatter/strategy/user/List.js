const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  UserSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/user/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for users list formatter.
 *
 * @class UsersFormatter
 */
class UsersFormatter extends BaseFormatter {
  /**
   * Constructor for  users list formatter.
   *
   * @param {object} params
   * @param {array} params.userIds
   * @param {object} params.usersByIdMap
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.userIds = params.userIds;
    oThis.usersByIdMap = params[entityTypeConstants.usersMap];
  }

  /**
   * Format the input object.
   *
   * @returns {result}
   * @private
   */
  _format() {
    const oThis = this;

    const finalResponse = [];

    for (let index = 0; index < oThis.userIds.length; index++) {
      const userId = oThis.userIds[index],
        user = oThis.usersByIdMap[userId];

      const formattedUser = new UserSingleFormatter({
        userId: userId,
        user: user
      }).perform();

      if (formattedUser.isFailure()) {
        return formattedUser;
      }

      finalResponse.push(formattedUser.data);
    }

    return responseHelper.successWithData(finalResponse);
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    if (!CommonValidators.validateArray(formattedEntity)) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_u_l_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: { array: formattedEntity }
      });
    }

    return responseHelper.successWithData({});
  }

  /**
   * Schema
   *
   * @returns {{type: string, items: *}}
   */
  static schema() {
    return {
      type: 'array',
      items: UserSingleFormatter.schema()
    };
  }
}

module.exports = UsersFormatter;
