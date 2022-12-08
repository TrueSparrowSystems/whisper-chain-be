const rootPrefix = '../..',
  util = require(rootPrefix + '/lib/util'),
  coreConstants = require(rootPrefix + '/config/coreConstants');

let longToShortMap = null;

/**
 * Class for s3 constants.
 *
 * @class S3
 */
class S3 {
  get imageFileType() {
    return 'image';
  }

  get userImagesResultKey() {
    return 'user_images';
  }

  /* Upload params - response entity keys start */

  get fileType() {
    return 'fileType';
  }

  get resultKey() {
    return 'resultKey';
  }

  get files() {
    return 'files';
  }

  /* Upload params - response entity keys end */

  get s3UrlPrefix() {
    return coreConstants.S3_URL_PREFIX;
  }

  /* AWS ACL valid values - Start */

  get privateAcl() {
    return 'private';
  }

  get publicReadAcl() {
    return 'public-read';
  }

  get publicReadWriteAcl() {
    return 'public-read-write';
  }

  get authenticatedReadAcl() {
    return 'authenticated-read';
  }

  get awsExecReadAcl() {
    return 'aws-exec-read';
  }

  get bucketOwnerReadAcl() {
    return 'bucket-owner-read';
  }

  get bucketOwnerFullControlAcl() {
    return 'bucket-owner-full-control';
  }

  /* AWS ACL valid values - End */

  /* URL prefixes - Start */

  get imageShortUrlPrefix() {
    return '{{s3_ui}}';
  }

  get fileNameShortSizeSuffix() {
    return '{{s}}';
  }

  get getGoogleMapShortUrlPrefix() {
    return '{{mgc}}';
  }

  /* URL prefixes - End */

  /**
   * Get google map url prefix.
   *
   * @returns {string}
   * @private
   */
  get getGoogleMapUrlPrefix() {
    return 'maps.google.com';
  }

  /**
   * Long to short url map.
   *
   * @returns {object}
   */
  get longUrlToShortUrlMap() {
    const oThis = this;

    if (!longToShortMap) {
      longToShortMap = Object.assign(
        {},
        oThis.longCdnUrlToShortUrlMap,
        oThis.longS3UrlToShortUrlMap,
        oThis.longExternalUrlToShortUrlMap
      );
    }

    return longToShortMap;
  }

  get longCdnUrlToShortUrlMap() {
    const oThis = this;

    return {
      [coreConstants.CDN_URL + '/' + coreConstants.S3_USER_IMAGES_FOLDER]: oThis.imageShortUrlPrefix
    };
  }

  get longS3UrlToShortUrlMap() {
    const oThis = this;

    return {
      [oThis.s3UrlPrefix + '/' + coreConstants.S3_USER_IMAGES_FOLDER]: oThis.imageShortUrlPrefix
    };
  }

  get longExternalUrlToShortUrlMap() {
    const oThis = this;

    return {
      [`https://${oThis.getGoogleMapUrlPrefix}`]: oThis.getGoogleMapShortUrlPrefix
    };
  }

  get shortUrlToLongUrlMapForResponse() {
    const oThis = this;

    return {
      [oThis.imageShortUrlPrefix]: [coreConstants.CDN_URL + '/' + coreConstants.S3_USER_IMAGES_FOLDER]
    };
  }

  convertToShortUrl(url) {
    const oThis = this;

    for (const longHand in oThis.longUrlToShortUrlMap) {
      url = url.replace(longHand, oThis.longUrlToShortUrlMap[longHand]);
    }

    return url;
  }

  convertToLongUrlForResponse(url) {
    const oThis = this;

    for (const shortHand in oThis.shortUrlToLongUrlMapForResponse) {
      url = url.replace(shortHand, oThis.shortUrlToLongUrlMapForResponse[shortHand]);
    }

    return url;
  }

  convertExternalToLongUrl(url) {
    const oThis = this;

    const invertedMap = util.invert(oThis.longExternalUrlToShortUrlMap);
    for (const shortHand in invertedMap) {
      url = url.replace(shortHand, invertedMap[shortHand]);
    }

    return url;
  }

  /**
   * Get s3 bucket.
   *
   * @param mediaKind
   * @param options
   *
   * @returns {*}
   */
  bucket(mediaKind, options = {}) {
    const oThis = this;

    if (mediaKind === oThis.imageFileType) {
      return coreConstants.S3_USER_ASSETS_BUCKET;
    }
    throw new Error('Unrecognized media kind.');
  }

  /**
   * Get full s3 url.
   *
   * @param intent
   * @param fileName
   * @param isEventMeetingRelatedImage
   *
   * @returns {string}
   */
  getS3Url(intent, fileName, options = {}) {
    const oThis = this;

    switch (intent) {
      case oThis.imageFileType: {
        const s3FilePath = coreConstants.S3_USER_IMAGES_FOLDER;

        return oThis.s3UrlPrefix + '/' + s3FilePath + '/' + fileName;
      }

      default:
        throw new Error('Unsupported file type.');
    }
  }
  /* S3 kinds based on different AWS Account */

  get S3Kind() {
    return 'S3';
  }
}

module.exports = new S3();
