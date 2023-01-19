const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName');

const webRouteSpec = {
  'POST /api/lens/connect': {
    apiName: apiNameConstants.lensConnect,
    summary: '',
    tag: '',
    description: ''
  },

  'GET /api/lens/chains': {
    apiName: apiNameConstants.fetchChains,
    summary: '',
    tag: '',
    description: ''
  },

  'GET /api/lens/:chain_id': {
    apiName: apiNameConstants.whispers,
    summary: '',
    tag: '',
    description: ''
  },

  'POST /api/lens/whispers': {
    apiName: apiNameConstants.createWhisper,
    summary: '',
    tag: '',
    description: ''
  },

  'POST /api/lens/ipfs-objects': {
    apiName: apiNameConstants.ipfsObjects,
    summary: '',
    tag: '',
    description: ''
  },

  'POST /api/lens/logout': {
    apiName: apiNameConstants.logout,
    summary: '',
    tag: '',
    description: ''
  },

  'GET /api/images': {
    apiName: apiNameConstants.suggestions,
    summary: '',
    tag: '',
    description: ''
  }
};

module.exports = webRouteSpec;
