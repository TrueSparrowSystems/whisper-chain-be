const rootPrefix = '../../..',
  commonParamErrorConfig = require(rootPrefix + '/config/apiParams/commonParamErrorConfig');

const lensSpecificErrorConfig = {};

const lensErrorConfig = Object.assign({}, commonParamErrorConfig, lensSpecificErrorConfig);

module.exports = lensErrorConfig;
