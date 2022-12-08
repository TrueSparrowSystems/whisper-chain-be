const express = require('express'),
  router = express.Router();

const rootPrefix = '../../..',
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  routeHelper = require(rootPrefix + '/routes/helper'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  webResponse = require(rootPrefix + '/config/apiParams/web/response');

const FormatterComposer = FormatterComposerFactory.getComposer(apiVersions.web);

/* Upload params */
router.get('/', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.uploadParams;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();
    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/UploadParams', 'r_a_w_up_1', null, dataFormatterFunc)
  );
});

module.exports = router;
