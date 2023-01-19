const express = require('express'),
  router = express.Router();

const rootPrefix = '../../..',
  cookieParser = require('cookie-parser'),
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  routeHelper = require(rootPrefix + '/routes/helper'),
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  webResponse = require(rootPrefix + '/config/apiParams/web/response'),
  cookieHelper = require(rootPrefix + '/lib/cookieHelper'),
  cookieConstants = require(rootPrefix + '/lib/globalConstant/cookie'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  whisperConstants = require(rootPrefix + '/lib/globalConstant/whispers');

const FormatterComposer = FormatterComposerFactory.getComposer(apiVersions.web);

/**
 * Set api_source in internal decoded params
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const setLensApiInternalParam = function(req, res, next) {
  req.internalDecodedParams.api_source = apiSourceConstants.lens;
  req.internalDecodedParams.platform = whisperConstants.lensPlatform;
  next();
};

// Set internal params
router.use(setLensApiInternalParam);

router.use(cookieParser(coreConstants.API_COOKIE_SECRET));

/* Post connect account */
router.post('/connect', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.lensConnect;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    if (serviceResponse.data.lensUserLoginCookieValue) {
      const options = {
        cookieValue: serviceResponse.data.lensUserLoginCookieValue,
        cookieName: cookieConstants.lensUserLoginCookieName,
        cookieExpiry: cookieConstants.lensCookieExpiryTime
      };

      cookieHelper.setLensUserLoginCookie(req, res, options);
    }

    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/Connect', 'r_a_l_5', null, dataFormatterFunc)
  );
});

/* Get chains data */
router.get('/chains', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.fetchChains;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/FetchChains', 'r_a_l_3', null, dataFormatterFunc)
  );
});

/* Get list of whisper of a chain. */
router.get('/:chain_id', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.whispers;
  req.internalDecodedParams.apiName = apiName;
  req.decodedParams.chain_id = req.params.chain_id;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/GetWhisperList', 'r_a_l_4', null, dataFormatterFunc)
  );
});

router.use(cookieHelper.validateUserLoginCookieIfPresent);

router.use(cookieHelper.validateUserLoginCookieRequired);

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
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/lens/GetIPFSObject', 'r_a_l_2', null, dataFormatterFunc)
  );
});

router.post('/logout', cookieHelper.parseLensUserLoginCookieForLogout, function(req, res, next) {
  req.internalDecodedParams.apiName = apiNameConstants.logout;

  Promise.resolve(routeHelper.perform(req, res, next, '/app/services/lens/Logout', 'r_a_l_6', null));
});

module.exports = router;
