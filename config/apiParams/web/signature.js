const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  paginationConstants = require(rootPrefix + '/lib/globalConstant/pagination');

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

  [apiNameConstants.ipfsObjects]: {
    mandatory: [
      {
        parameter: 's3_url',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'title',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'description',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ],
    optional: []
  },

  [apiNameConstants.createWhisper]: {
    mandatory: [
      {
        parameter: 'current_user',
        validatorMethods: [{ validateNonEmptyObject: null }],
        kind: 'internal'
      },
      {
        parameter: 'transaction_hash',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'whisper_ipfs_object_id',
        validatorMethods: [{ validateInteger: null }],
        type: 'number'
      },
      {
        parameter: 'image_ipfs_object_id',
        validatorMethods: [{ validateInteger: null }],
        type: 'number'
      },
      {
        parameter: 'chain_id',
        validatorMethods: [{ validateInteger: null }],
        type: 'number'
      },
      {
        parameter: 's3_url',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ],
    optional: []
  },
  [apiNameConstants.fetchChains]: {
    mandatory: [
      {
        parameter: 'page',
        validatorMethods: [{ validateNonZeroInteger: null }],
        type: 'number'
      },
      {
        parameter: 'platform',
        validatorMethods: [{ validateString: null }],
        kind: 'internal'
      },
      {
        parameter: 'limit',
        validatorMethods: [{ validateNonZeroInteger: null }],
        type: 'number'
      }
    ],
    optional: []
  },
  [apiNameConstants.whispers]: {
    mandatory: [
      {
        parameter: 'chain_id',
        validatorMethods: [{ validateNonZeroInteger: null }],
        type: 'number'
      },
      {
        parameter: 'page',
        validatorMethods: [{ validateNonZeroInteger: null }],
        type: 'number'
      },
      {
        parameter: 'limit',
        validatorMethods: [{ validateNonZeroInteger: null }],
        type: 'number'
      }
    ],
    optional: []
  },
  [apiNameConstants.lensConnect]: {
    mandatory: [
      {
        parameter: 'platform',
        validatorMethods: [{ validateString: null }],
        kind: 'internal'
      },
      {
        parameter: 'platform_profile_image_url',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'platform_user_id',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'platform_display_name',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'platform_username',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'challenge_message',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'signed_challenge_message',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      },
      {
        parameter: 'wallet_address',
        validatorMethods: [{ validateString: null }],
        type: 'string'
      }
    ],
    optional: []
  },

  [apiNameConstants.logout]: {
    mandatory: [],
    optional: []
  }
};
module.exports = webSignature;
