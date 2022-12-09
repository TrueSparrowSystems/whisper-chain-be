const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

const webResponse = {
  [apiNameConstants.getAllUsers]: {
    resultType: responseEntityKey.userIds,
    resultTypeLookup: responseEntityKey.users,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.userIds]: responseEntityKey.userIds,
      [entityTypeConstants.usersMap]: responseEntityKey.users,
      [entityTypeConstants.getAllUsersListMeta]: responseEntityKey.meta
    }
  },

  [apiNameConstants.emailSignUp]: {},

  [apiNameConstants.uploadParams]: {
    resultType: responseEntityKey.uploadParams,
    resultTypeLookup: responseEntityKey.uploadParams,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.uploadParams]: responseEntityKey.uploadParams
    }
  },

  [apiNameConstants.suggestions]: {
    resultType: responseEntityKey.s3Urls,
    resultTypeLookup: responseEntityKey.s3Urls,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.s3Urls]: responseEntityKey.s3Urls
    }
  }
};

module.exports = webResponse;
