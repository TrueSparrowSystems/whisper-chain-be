const rootPrefix = '../../..',
  apiNameConstants = require(rootPrefix + '/lib/globalConstant/apiName');

const webRouteSpec = {
  'GET /api/web/users': {
    apiName: apiNameConstants.getAllUsers,
    summary: 'Get all users',
    // description: Optional extended description in CommonMark or HTML.
    tag: 'user CRUD'
  },

  'POST /api/web/signup': {
    apiName: apiNameConstants.emailSignUp,
    summary: 'user sign up',
    tag: 'user CRUD'
  },

  'GET /api/web/upload-params': {
    apiName: apiNameConstants.uploadParams,
    summary: 'Upload Params for S3 upload',
    tag: 's3 upload params'
  }
};

module.exports = webRouteSpec;
