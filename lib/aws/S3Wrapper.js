require('https').globalAgent.keepAlive = true;

const AWS = require('aws-sdk');

const fs = require('fs');

const rootPrefix = '../..',
  s3Constants = require(rootPrefix + '/lib/globalConstant/s3'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

AWS.config.httpOptions.keepAlive = true;
AWS.config.httpOptions.disableProgressEvents = false;

const instanceMap = {};

class S3Wrapper {
  /**
   * Create pre-signed post.
   *
   * @param {string} mediaKind
   * @param {string} fileName
   * @param {string} contentType
   * @param {object} options - optional parameters
   *
   * @returns {Promise<*>}
   */
  async createPresignedPostFor(mediaKind, fileName, contentType, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;

    const AWSS3 = oThis._getS3Instance(options);

    const _bucket = s3Constants.bucket(mediaKind, options),
      _key = oThis._key(mediaKind, fileName, options),
      _contentType = contentType,
      _cacheControl = 'public, max-age=315360000',
      _acl = oThis._acl(options),
      _disposition = 'inline';

    const params = {
      Bucket: _bucket,
      Expires: 3600, // 1 hour
      Conditions: [
        { bucket: _bucket },
        { acl: _acl },
        { 'Content-Type': _contentType },
        { 'Content-Disposition': _disposition },
        { key: _key },
        { 'Cache-Control': _cacheControl },
        { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
        ['content-length-range', oThis._minContentLength(mediaKind), oThis._maxContentLength(mediaKind)]
      ],
      Fields: {
        key: _key
      }
    };

    let presignedPostResponse = null;

    await new Promise(function(onResolve, onReject) {
      AWSS3.createPresignedPost(params, function(err, data) {
        if (err) {
          logger.debug('params=====', params);
          logger.error('Pre-signing post data encountered an error: ', err);
          onReject(new Error('Error while creating presigned url.'));
        } else {
          presignedPostResponse = data;
          onResolve();
        }
      });
    });

    const _fields = presignedPostResponse.fields;

    _fields['Content-Type'] = _contentType;
    _fields['Cache-Control'] = _cacheControl;
    _fields.acl = _acl;
    _fields['Content-disposition'] = _disposition;

    return presignedPostResponse;
  }

  /**
   * Check if file exists on s3.
   *
   * @param {string} fileName
   * @param {string} mediaKind
   * @param {object} [options]
   *
   * @returns {Promise<any>}
   */
  checkFileExists(fileName, mediaKind, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;

    const AWSS3 = oThis._getS3Instance(options);

    const params = {
      Bucket: s3Constants.bucket(mediaKind, options),
      Key: oThis._key(mediaKind, fileName, options)
    };

    return new Promise(function(onResolve) {
      AWSS3.headObject(params)
        .promise()
        .then(function(resp) {
          onResolve(responseHelper.successWithData(resp));
        })
        .catch(function(err) {
          console.log('err-------', err);
          onResolve(
            responseHelper.error({
              internal_error_identifier: 'l_s3w_1',
              api_error_identifier: 'invalid_params',
              debug_options: { fileName: fileName }
            })
          );
        });
    });
  }

  /**
   * Put object in s3 object.
   *
   * @param {string} bucket
   * @param {string} key
   * @param {string} filePath
   *
   * @returns {Promise<any>}
   */
  putObject(bucket, key, filePath, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;
    const AWSS3 = oThis._getS3Instance(options);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(filePath)
    };

    return new Promise(function(onResolve) {
      console.log('params-------', JSON.stringify(params));
      AWSS3.putObject(params)
        .promise()
        .then(function(resp) {
          onResolve(responseHelper.successWithData(resp));
        })
        .catch(function(err) {
          console.log('err-------', err);
          onResolve(
            responseHelper.error({
              internal_error_identifier: 'l_s3w_po_1',
              api_error_identifier: 'invalid_params',
              debug_options: params
            })
          );
        });
    });
  }

  /**
   * Generate signed urls with expiry.
   *
   * @param {string} fileName
   * @param {string} mediaKind
   * @param {number} urlExpiry
   * @param {object} [options]
   *
   * @returns {*|void|string}
   */
  getSignedUrl(fileName, mediaKind, urlExpiry, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;

    const contentDisposition = options.contentDisposition;

    const AWSS3 = oThis._getS3Instance(options);
    const params = {
      Bucket: s3Constants.bucket(mediaKind, options),
      Key: oThis._key(mediaKind, fileName, options),
      Expires: urlExpiry
    };

    if (contentDisposition) {
      params.ResponseContentDisposition = contentDisposition;
    }

    return AWSS3.getSignedUrl('getObject', params);
  }

  /**
   * Download file from s3 to disk.
   *
   * @param {string} bucket
   * @param {string} key
   * @param {string} downloadPath
   *
   * @returns {Promise<*>}
   */
  downloadObjectToDisk(bucket, key, downloadPath, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;

    fs.closeSync(fs.openSync(downloadPath, 'w'));
    const file = fs.createWriteStream(downloadPath);

    const AWSS3 = oThis._getS3Instance(options);
    const params = { Bucket: bucket, Key: key };

    return new Promise(function(onResolve, onReject) {
      AWSS3.getObject(params, function(err, res) {
        if (err == null) {
          file.write(res.Body, function(error) {
            if (error) {
              const errObj = responseHelper.error({
                internal_error_identifier: 'l_s3w_2',
                api_error_identifier: 'something_went_wrong',
                debug_options: { err: error }
              });

              onReject(errObj);
            }

            file.end();
            onResolve(responseHelper.successWithData({}));
          });
        } else {
          const errObj = responseHelper.error({
            internal_error_identifier: 'l_s3w_3',
            api_error_identifier: 'something_went_wrong',
            debug_options: ''
          });

          onReject(errObj);
        }
      });
    });
  }

  /**
   * Change s3 object permissions.
   *
   * @param {string} bucket
   * @param {string} key
   * @param {string} permission
   *
   * @returns {Promise<*>}
   */
  changeObjectPermissions(bucket, key, permission, options = { kind: s3Constants.S3Kind }) {
    const oThis = this;

    const AWSS3 = oThis._getS3Instance(options);
    const params = { Bucket: bucket, Key: key, ACL: permission };

    return new Promise(function(onResolve, onReject) {
      AWSS3.putObjectAcl(params, function(err, data) {
        if (err == null) {
          onResolve(responseHelper.successWithData({ data: data }));
        } else {
          logger.error(err);
          const errObj = responseHelper.error({
            internal_error_identifier: 'l_s3w_4',
            api_error_identifier: 'something_went_wrong',
            debug_options: ''
          });

          onReject(errObj);
        }
      });
    });
  }

  /**
   * Get s3 instance.
   *
   * @param {object} options
   *
   * @returns {*}
   */
  _getS3Instance(options) {
    const region = coreConstants.AWS_REGION;
    const instanceKey = `${coreConstants.AWS_ACCESS_KEY}-${region}`;

    if (!instanceMap[instanceKey]) {
      instanceMap[instanceKey] = new AWS.S3({
        accessKeyId: coreConstants.AWS_ACCESS_KEY,
        secretAccessKey: coreConstants.AWS_SECRET_KEY,
        region: region
      });
    }
    return instanceMap[instanceKey];
  }

  /**
   * Key / path of the file.
   *
   * @param {string} mediaKind
   * @param {string} fileName
   * @param {object} [options]
   *
   * @returns {string}
   * @private
   */
  _key(mediaKind, fileName, options = {}) {
    const fileWithPath = options.dynamicPath ? options.dynamicPath + '/' + fileName : fileName;

    switch (mediaKind) {
      case s3Constants.imageFileType: {
        if (options.fileType) {
          return coreConstants.S3_USER_IMAGES_FOLDER + '/' + fileWithPath;
        }
      }
      default: {
        throw new Error('Unrecognized kind.');
      }
    }
  }

  /**
   * Get ACL for given file.
   *
   * @param {object} options
   *
   * @returns {string}
   * @private
   */
  _acl(options) {
    if (options.fileType) {
      return s3Constants.publicReadAcl;
    }
  }

  /**
   * Get min content length.
   *
   * @param {string} mediaKind
   *
   * @returns {number}
   * @private
   */
  _minContentLength(mediaKind) {
    if (mediaKind === s3Constants.imageFileType) {
      return 1024; // 1 Kb
    }
    throw new Error('Unrecognized media kind.');
  }

  /**
   * Get max content length.
   *
   * @param {string} mediaKind
   *
   * @returns {number}
   * @private
   */
  _maxContentLength(mediaKind) {
    if (mediaKind === s3Constants.imageFileType) {
      return 15728640; // 15 Mb
    }
    throw new Error('Unrecognized media kind.');
  }
}

module.exports = new S3Wrapper();
