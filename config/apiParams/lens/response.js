const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

const lensResponse = {
  [apiNameConstants.createWhisper]: {},
  [apiNameConstants.ipfsObjects]: {
    resultType: responseEntityKey.ipfsObjectIds,
    resultTypeLookup: responseEntityKey.ipfsObjects,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.ipfsObjectIds]: responseEntityKey.ipfsObjectIds,
      [entityTypeConstants.ipfsObjects]: responseEntityKey.ipfsObjects
    }
  }
};

module.exports = lensResponse;
