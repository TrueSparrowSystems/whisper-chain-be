const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName');

const webRouteSpec = {
  'POST /api/lens/connect': {
    apiName: apiNameConstants.lensConnect,
    summary: 'User connect',
    tag: 'Connect',
    description: 'User is logged in and cookie created for handling auth in subsequent requests.'
  },

  'GET /api/lens/chains': {
    apiName: apiNameConstants.fetchChains,
    summary: 'Get chains to be shown on homepage.',
    tag: 'Home Page',
    description: 'Returns a list of chains and at max 3 whispers from each chain. Pagination support is present.'
  },

  'GET /api/lens/:chain_id': {
    apiName: apiNameConstants.whispers,
    summary: 'Get whispers from a specific chain',
    tag: 'Chain Page',
    description: 'Returns list of whispers which belong to a specific chain. Pagination support is present.'
  },

  'POST /api/lens/whispers': {
    apiName: apiNameConstants.createWhisper,
    summary: 'Add to chain',
    tag: 'Generate Page',
    description: 'Add to chain and create a whisper.'
  },

  'POST /api/lens/ipfs-objects': {
    apiName: apiNameConstants.ipfsObjects,
    summary: 'Upload to IPFS',
    tag: 'Generate Page',
    description: 'Upload image and metadata to IPFS and return cid in response.'
  },

  'POST /api/lens/logout': {
    apiName: apiNameConstants.logout,
    summary: 'Logout',
    tag: 'Logout',
    description: ''
  },

  'GET /api/images': {
    apiName: apiNameConstants.suggestions,
    summary: 'Generate suggestions',
    tag: 'Generate Page',
    description:
      'Using stable diffusion in the BE, generate image suggestions using the prompt and art style input from user.'
  }
};

module.exports = webRouteSpec;
