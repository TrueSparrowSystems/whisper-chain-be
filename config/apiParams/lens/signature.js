const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName');

const lensSignature = {
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
  [apiNameConstants.ipfsObjects]: {
    mandatory: [
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
      }, {
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
  }
};
module.exports = lensSignature;
