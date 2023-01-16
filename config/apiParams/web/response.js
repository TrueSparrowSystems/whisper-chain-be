const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

const webResponse = {
  [apiNameConstants.suggestions]: {
    resultType: responseEntityKey.suggestionsIds,
    resultTypeLookup: responseEntityKey.suggestions,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.suggestionsIds]: responseEntityKey.suggestionsIds,
      [entityTypeConstants.suggestions]: responseEntityKey.suggestions
    }
  }
};

module.exports = webResponse;
