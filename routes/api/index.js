const express = require('express');

const rootPrefix = '../..',
  imagesRoutes = require(rootPrefix + '/routes/api/images/index'),
  lensRoutes = require(rootPrefix + '/routes/api/lens/index'),
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

// Lens routes.
router.use('/lens', webApis, lensRoutes);

// Api image routes.
router.use('/images', webApis, imagesRoutes);

module.exports = router;
