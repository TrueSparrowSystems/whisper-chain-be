const rootPrefix = '../../..',
  commonParamErrorConfig = require(rootPrefix + '/config/apiParams/commonParamErrorConfig');

const webSpecificErrorConfig = {};

const webErrorConfig = Object.assign({}, commonParamErrorConfig, webSpecificErrorConfig);

module.exports = webErrorConfig;
