const express = require('express'),
  router = express.Router();

const rootPrefix = '../../..',
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  routeHelper = require(rootPrefix + '/routes/helper'),
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  lensResponse = require(rootPrefix + '/config/apiParams/lens/response'),
  cookieHelper = require(rootPrefix + '/lib/cookieHelper');

const FormatterComposer = FormatterComposerFactory.getComposer(apiVersions.lens);

/**
 * Set api_source in internal decoded params
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const setLensApiSourceInternalParam = function(req, res, next) {
  req.internalDecodedParams.api_source = apiSourceConstants.lens;
  next();
};

// Set internal params
router.use(setLensApiSourceInternalParam);

router.use(cookieHelper.validateUserLoginCookieIfPresent);

/* Post create whispers */
router.post('/whispers', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.createWhisper;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    serviceResponse.data = {};
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/CreateWhisper', 'r_a_l_1', null, dataFormatterFunc)
  );
});

/* Post create IPFS object */
router.post('/ipfs-objects', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.ipfsObjects;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, lensResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/GetIPFSObject', 'r_a_l_2', null, dataFormatterFunc)
  );
});

/* Post create IPFS object */
router.get('/chains', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.fetchChains;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, lensResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/FetchChains', 'r_a_l_3', null, dataFormatterFunc)
  );
});

module.exports = router;
