const express = require('express'),
  router = express.Router();

const rootPrefix = '../../..',
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  routeHelper = require(rootPrefix + '/routes/helper'),
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  webResponse = require(rootPrefix + '/config/apiParams/web/response');

const FormatterComposer = FormatterComposerFactory.getComposer(apiVersions.web);

/**
 * Set api_source in internal decoded params
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const setWebApiSourceInternalParam = function(req, res, next) {
  req.internalDecodedParams.api_source = apiSourceConstants.web;
  next();
};

// Set internal params
router.use(setWebApiSourceInternalParam);

/* GET suggestions */
router.get('/', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.suggestions;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/whisper/GetSuggestions', 'r_a_w_1', null, dataFormatterFunc)
  );
});

module.exports = router;
