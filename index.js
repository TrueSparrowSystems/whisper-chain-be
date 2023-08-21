const rootPrefix = '.',
  serverless = require('serverless-http');

const express = require('express'),
  createNamespace = require('continuation-local-storage').createNamespace,
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  helmet = require('helmet'),
  swaggerJSDoc = require('swagger-jsdoc'),
  swaggerUi = require('swagger-ui-express'),
  customUrlParser = require('url'),
  URL = require('url').URL;

const requestSharedNameSpace = createNamespace('eeeApiNameSpace');

const responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  customMiddleware = require(rootPrefix + '/helpers/customMiddleware'),
  apiVersions = require(rootPrefix + '/lib/globalConstant/apiVersions'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  sanitizer = require(rootPrefix + '/helpers/sanitizer');

const apiRoutes = require(rootPrefix + '/routes/api/index');

const errorConfig = basicHelper.fetchErrorConfig(apiVersions.web);
const apiHostName = new URL(coreConstants.API_DOMAIN).hostname;

morgan.token('id', function getId(req) {
  return req.id;
});

// eslint-disable-next-line no-unused-vars
morgan.token('pid', function getPid(req) {
  return process.pid;
});

// eslint-disable-next-line no-unused-vars
morgan.token('endTime', function getEndTime(req) {
  return Date.now();
});

// eslint-disable-next-line no-unused-vars
morgan.token('endDateTime', function getEndDateTime(req) {
  return basicHelper.logDateFormat();
});

morgan.token('ipAddress', function getIpAddress(req) {
  return req.headers['x-real-ip'];
});

/**
 * First log line of request start
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const startRequestLogLine = function(req, res, next) {
  const message = [
    "Started '",
    customUrlParser.parse(req.originalUrl).pathname,
    "'  '",
    req.method,
    "' at ",
    basicHelper.logDateFormat()
  ];

  logger.step(message.join(''));

  if (!basicHelper.isProduction()) {
    logger.step(
      '\nHEADERS FOR CURRENT REQUEST=====================================\n',
      JSON.stringify(req.headers),
      '\n========================================================'
    );
  }

  next();
};

/**
 * Get request params
 *
 * @param {object} req
 * @return {*}
 */
const getRequestParams = function(req) {
  // IMPORTANT NOTE: Don't assign parameters before sanitization.
  if (req.method === 'POST') {
    return req.body;
  } else if (req.method === 'GET') {
    return req.query;
  }

  return {};
};

/**
 * Assign params
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const assignParams = function(req, res, next) {
  req.decodedParams = getRequestParams(req);

  /**
   * Internal decoded params are for parameters which are not passed in the request from outside.
   * Setting it to empty object is needed from security point of view.
   */
  req.internalDecodedParams = {};

  next();
};

/**
 * Set request debugging/logging details to shared namespace.
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const appendRequestDebugInfo = function(req, res, next) {
  requestSharedNameSpace.run(function() {
    requestSharedNameSpace.set('reqId', req.id);
    requestSharedNameSpace.set('startTime', req.startTime);
    next();
  });
};

/**
 * Set response headers
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 *
 * @returns {Promise<void>}
 */
const setResponseHeader = async function(req, res, next) {
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate, post-check=0, pre-check=0');
  res.setHeader('Vary', '*');
  res.setHeader('Expires', '-1');
  res.setHeader('Last-Modified', new Date().toUTCString());
  next();
};

// Set worker process title.
process.title = 'Whisper Chain API';

// Create express application instance.
const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, PUT, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'sentry-trace, host-header, authorization, Participant-Id, Origin, X-Requested-With, Accept, Content-Type, Referer, Cookie, Last-Modified, Cache-Control, Content-Language, Expires, Pragma, Content-Type, Authorization, Set-Cookie, Preparation-Time'
  );
  res.header('Access-Control-Allow-Origin', coreConstants);

  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).json();
  }
  next();
});

// API Docs for web APIs
const swaggerSpecWeb = swaggerJSDoc(require(rootPrefix + '/config/apiParams/web/openapi.json'));
const swaggerHtmlWeb = swaggerUi.generateHTML(swaggerSpecWeb);

app.use('/api-docs', swaggerUi.serveFiles(swaggerSpecWeb));
app.get('/api-docs', function(req, res) {
  return res.send(swaggerHtmlWeb);
});

// Add id and startTime to request.
app.use(customMiddleware());

// Load Morgan
app.use(
  morgan(
    '[:pid][:id][:endTime][' +
      coreConstants.APP_NAME +
      '] Completed with ":status" in :response-time ms at :endDateTime -  ":res[content-length] bytes" - ":ipAddress" ":remote-user" - "HTTP/:http-version :method :url" - ":referrer" - ":user-agent" \n\n'
  )
);

app.use(function(req, res, next) {
  let data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
  });
  next();
});

// Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet());

// Node.js body parsing middleware. Default limit is 100kb
app.use(bodyParser.json({ limit: '2mb' }));

// Parsing the URL-encoded data with the qs library (extended: true). Default limit is 100kb
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

// Start Request logging. Placed below static and health check to reduce logs.
app.use(appendRequestDebugInfo, startRequestLogLine);

// Set response headers.
app.use(setResponseHeader);

// Health checker.
app.get('/api/health-check', async function(req, res) {
  console.log('** Health check success.');
  res.send(new Date());
});

/**
 * NOTE: API routes where first sanitize and then assign params.
 */
app.use('/api', sanitizer.sanitizeBodyAndQuery, assignParams, function(request, response, next) {
  if (request.hostname === apiHostName) {
    apiRoutes(request, response, next);
  } else {
    next();
  }
});

// Catch 404 and forward to error handler.
// eslint-disable-next-line no-unused-vars
app.use(function(req, res, next) {
  return responseHelper.renderApiResponse(
    responseHelper.error({
      internal_error_identifier: 'a_1',
      api_error_identifier: 'resource_not_found',
      debug_options: {}
    }),
    res,
    errorConfig
  );
});

// Error handler.
// eslint-disable-next-line no-unused-vars
app.use(async function(err, req, res, next) {
  let errorObject = null;

  if (err.code == 'EBADCSRFTOKEN') {
    logger.error('a_3', 'Bad CSRF TOKEN', err);

    errorObject = responseHelper.error({
      internal_error_identifier: 'a_2',
      api_error_identifier: 'forbidden_api_request',
      debug_options: {}
    });
  } else {
    logger.error('a_3', 'Something went wrong', err);

    errorObject = responseHelper.error({
      internal_error_identifier: 'a_2',
      api_error_identifier: 'something_went_wrong',
      debug_options: { err: err }
    });

    logger.error(' In catch block of index.js', errorObject);
  }

  return responseHelper.renderApiResponse(errorObject, res, errorConfig);
});

// If running in development mode, start the server on port, else export handler for lambda
if (coreConstants.environment === 'development') {
  logger.log('Server running on localhost:', coreConstants.port);
  module.exports = app;
} else {
  // Create an API Gateway proxy handler
  const handler = serverless(app);
  // Export the handler for Lambda
  module.exports = { handler };
}
