const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  paginationConstants = require(rootPrefix + '/lib/globalConstant/pagination');

/*
   Example of mandatory param config:
    {
        parameter: 'api_source',
        validatorMethods: [{ validateString: null }],
        kind: 'internal',
        missingKeyError: null,
        type: 'string'
      }
 */

/*
   Example of optional param config:
    {
        parameter: 'api_source',
        validatorMethods: [{ validateString: null }],
        kind: 'internal',
        type: 'string'
      }
 */

const webSignature = {
  [apiNameConstants.suggestions]: {
    mandatory: [
      {
        parameter: 'prompt',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ],
    optional: [
      {
        parameter: 'art_style',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ]
  },

  [apiNameConstants.ipfsMetaData]: {
    mandatory: [
      {
        parameter: 's3_url',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ],
    optional: []
  }
};
module.exports = webSignature;
