const express = require('express');

const rootPrefix = '../..',
  v1Routes = require(rootPrefix + '/routes/api/v1/index'),
  webRoutes = require(rootPrefix + '/routes/api/web/index'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions');

const router = express.Router();

/**
 * Web APIs middleware.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const webApis = function(req, res, next) {
  req.internalDecodedParams.apiVersion = apiVersions.web;
  next();
};

/**
 * App v1 APIs middleware.
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
const appV1Apis = function(req, res, next) {
  req.internalDecodedParams.apiVersion = apiVersions.v1;
  next();
};

// Web routes.
router.use('/web', webApis, webRoutes);

// Api v1 routes.
router.use('/v1', appV1Apis, v1Routes);

module.exports = router;
