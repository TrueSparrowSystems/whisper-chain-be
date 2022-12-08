const express = require('express'),
  cookieParser = require('cookie-parser'),
  router = express.Router();

const rootPrefix = '../../..',
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory'),
  cookieHelper = require(rootPrefix + '/lib/cookieHelper'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  routeHelper = require(rootPrefix + '/routes/helper'),
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName'),
  webResponse = require(rootPrefix + '/config/apiParams/web/response');

/* Upload params routes */
const uploadParamsRoutes = require(rootPrefix + '/routes/api/web/uploadParams');

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

// Node.js cookie parsing middleware.
router.use(cookieParser(coreConstants.WEB_COOKIE_SECRET));

// Set internal params
router.use(setWebApiSourceInternalParam);

/* Email signup */
router.post('/signup', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  req.internalDecodedParams.apiName = apiNameConstants.emailSignUp;

  const dataFormatterFunc = async function(serviceResponse) {
    if (serviceResponse.data.userLoginCookieValue) {
      cookieHelper.setUserLoginCookie(req, res, serviceResponse.data.userLoginCookieValue);
    }

    serviceResponse.data = {};
  };

  Promise.resolve(routeHelper.perform(req, res, next, '/app/services/auth/Signup', 'r_a_w_1', null, dataFormatterFunc));
});

router.use(cookieHelper.validateUserLoginCookieIfPresent);

router.use(cookieHelper.validateUserLoginCookieRequired);

/* GET all users. */
router.get('/users', sanitizer.sanitizeDynamicUrlParams, function(req, res, next) {
  const apiName = apiNameConstants.getAllUsers;
  req.internalDecodedParams.apiName = apiName;

  const dataFormatterFunc = async function(serviceResponse) {
    const formatterParams = Object.assign({}, webResponse[apiName], { serviceData: serviceResponse.data });
    formatterParams.entityKindToResponseKeyMap = Object.assign({}, formatterParams.entityKindToResponseKeyMap);
    const wrapperFormatterRsp = await new FormatterComposer(formatterParams).perform();

    serviceResponse.data = wrapperFormatterRsp.data;
  };

  Promise.resolve(
    routeHelper.perform(req, res, next, '/app/services/user/GetAllUsers', 'r_a_w_2', null, dataFormatterFunc)
  );
});

router.use('/upload-params', uploadParamsRoutes);

module.exports = router;
