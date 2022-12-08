const express = require('express'),
  cookieParser = require('cookie-parser'),
  router = express.Router();

const rootPrefix = '../../..',
  basicHelper = require(rootPrefix + '/helpers/basic'),
  headerHelper = require(rootPrefix + '/helpers/header'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  apiSourceConstants = require(rootPrefix + '/lib/globalConstant/apiSource');

const errorConfig = basicHelper.fetchErrorConfig(apiVersions.v1);

/**
 * Set api_source in internal decoded params
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const setAppApiSourceInternalParam = function(req, res, next) {
  req.internalDecodedParams.api_source = apiSourceConstants.app;
  next();
};

/**
 * Check if app build is within supported range.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 *
 * @returns {*}
 */
const checkMinBuildRequirement = function(req, res, next) {
  const os = headerHelper.deviceOs(req.internalDecodedParams.headers).toLowerCase();
  const buildNumber = headerHelper.buildNumber(req.internalDecodedParams.headers);
  const minSupportedBuild = Number(coreConstants.MIN_SUPPORTED_BUILD_NUMBER[os]);

  if (minSupportedBuild > 0 && buildNumber > 0 && buildNumber < minSupportedBuild) {
    const errorObject = responseHelper.error({
      internal_error_identifier: 'a_v1_1',
      api_error_identifier: 'app_no_longer_supported',
      debug_options: {
        min_supported_build_number: minSupportedBuild
      }
    });

    logger.error(' In catch block of v1/index.js', errorObject);

    return responseHelper.renderApiResponse(errorObject, res, errorConfig);
  }
  next();
};

// Node.js cookie parsing middleware.
router.use(cookieParser(coreConstants.V1_COOKIE_SECRET));
// Set internal params
router.use(setAppApiSourceInternalParam);

router.use(sanitizer.sanitizeHeaderParams);

router.use(checkMinBuildRequirement);

module.exports = router;
