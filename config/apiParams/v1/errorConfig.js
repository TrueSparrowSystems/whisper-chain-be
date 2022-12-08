const rootPrefix = '../../..',
  commonParamErrorConfig = require(rootPrefix + '/config/apiParams/commonParamErrorConfig');

const v1SpecificErrorConfig = {};

const v1ErrorConfig = Object.assign({}, commonParamErrorConfig, v1SpecificErrorConfig);

module.exports = v1ErrorConfig;
