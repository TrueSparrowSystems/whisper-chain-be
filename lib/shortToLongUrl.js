const rootPrefix = '..',
  s3Constants = require(rootPrefix + '/lib/globalConstant/s3');

/**
 * Class to convert short to long url.
 *
 * @class ShortToLongUrl
 */
class ShortToLongUrl {
  /**
   * This gives long url of cloudfront.
   *
   * @param {string} urlTemplate
   * @param {string} [size]
   *
   * @returns {*}
   */
  getFullUrl(urlTemplate, size) {
    const oThis = this;

    let fullUrl = s3Constants.convertToLongUrlForResponse(urlTemplate);

    if (fullUrl) {
      fullUrl = oThis.replaceSizeInUrlTemplate(fullUrl, size);
    }

    console.log('getFullUrl ==============', fullUrl);

    return fullUrl;
  }

  /**
   * Replace size in url template.
   *
   * @param {string} urlTemplate
   * @param {string} size
   *
   * @returns {string}
   */
  replaceSizeInUrlTemplate(urlTemplate, size) {
    let sizeNameWithDash = '';
    if (size) {
      sizeNameWithDash = '-' + size;
    }

    return urlTemplate.replace(s3Constants.fileNameShortSizeSuffix, sizeNameWithDash);
  }
}

module.exports = new ShortToLongUrl();
