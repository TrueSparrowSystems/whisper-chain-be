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
  },
  [apiNameConstants.whispers]: {
    resultType: responseEntityKey.whisperIds,
    resultTypeLookup: responseEntityKey.whipsers,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.whisperIds]: responseEntityKey.whisperIds,
      [entityTypeConstants.whispers]: responseEntityKey.whipsers,
      [entityTypeConstants.chains]: responseEntityKey.chains,
      [entityTypeConstants.images]: responseEntityKey.images,
      [entityTypeConstants.users]: responseEntityKey.users
    }
  }
};

module.exports = lensResponse;
