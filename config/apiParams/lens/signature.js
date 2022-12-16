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
  }
};
module.exports = lensSignature;
