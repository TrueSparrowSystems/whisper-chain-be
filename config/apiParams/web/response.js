const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  responseEntityKey = require(rootPrefix + '/lib/globalConstant/responseEntityKey');

const webResponse = {
  [apiNameConstants.suggestions]: {
    resultType: responseEntityKey.s3,
    resultTypeLookup: responseEntityKey.s3,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.s3]: responseEntityKey.s3
    }
  },

  [apiNameConstants.ipfsMetaData]: {
    resultType: responseEntityKey.ipfsMetadata,
    resultTypeLookup: responseEntityKey.ipfsMetadata,
    entityKindToResponseKeyMap: {
      [entityTypeConstants.ipfsMetadata]: responseEntityKey.ipfsMetadata
    }
  }
};

module.exports = webResponse;
