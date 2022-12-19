const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  UserSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/User/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for users map formatter.
 *
 * @class UsersMapFormatter
 */
class UsersMapFormatter extends BaseFormatter {
  /**
   * Constructor for users map formatter.
   *
   * @param {object} params
   * @param {object} params.users
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.usersByIdMap = params[entityTypeConstants.users];
  }

  /**
   * Format the input object.
   *
   * @returns {result}
   * @private
   */
  _format() {
    const oThis = this;

    const finalResponse = {};

    for (const user in oThis.usersByIdMap) {
      const userObj = oThis.usersByIdMap[user];

      const formattedUser = new UserSingleFormatter({
        id: userObj.id,
        uts: userObj.uts,
        platform: userObj.platform,
        platformUserId: userObj.platformUserId,
        platformDisplayName: userObj.platformDisplayName,
        platformUsername: userObj.platformUsername,
        platformProfileImageId: userObj.platformProfileImageId,
        status: userObj.status
      }).perform();

      if (formattedUser.isFailure()) {
        return formattedUser;
      }

      finalResponse[userObj.id] = formattedUser.data;
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
    if (!CommonValidators.validateObject(formattedEntity)) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_u_m_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: {
          object: formattedEntity
        }
      });
    }

    return responseHelper.successWithData({});
  }

  static schema() {
    // We will need to construct an example for the map
    const singleSchema = UserSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: UserSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = UsersMapFormatter;
