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
  [apiNameConstants.emailSignUp]: {
    mandatory: [
      {
        parameter: 'email',
        validatorMethods: [{ validateString: null }, { isValidEmail: null }],
        type: 'string',
        description: 'elaborated description if needed.'
      },
      {
        parameter: 'password',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'api_source',
        validatorMethods: [{ validateString: null }],
        kind: 'internal',
        type: 'string'
      }
    ],
    optional: []
  },

  [apiNameConstants.getAllUsers]: {
    mandatory: [
      {
        parameter: 'api_source',
        validatorMethods: [{ validateString: null }],
        kind: 'internal',
        type: 'string'
      }
    ],
    optional: [
      {
        parameter: paginationConstants.paginationIdentifierKey, // Pagination identifier.
        validatorMethods: [{ validateString: null }, { validatePaginationIdentifier: null }],
        type: 'string'
      }
    ]
  },

  [apiNameConstants.uploadParams]: {
    mandatory: [],
    optional: [
      {
        parameter: 'user_images',
        validatorMethods: [{ validateNonBlankStringArray: 'invalid_images' }],
        type: 'array'
      }
    ]
  },

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
  }
};
module.exports = webSignature;
