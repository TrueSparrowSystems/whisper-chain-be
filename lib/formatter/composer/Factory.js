const rootPrefix = '../../..',
  CommonFormatterComposer = require(rootPrefix + '/lib/formatter/composer/Common');

class FormatterComposerFactory {
  /**
   * Get Composer class for the api version
   *
   * @param apiVersion
   * @returns {any}
   */
  static getComposer(apiVersion) {
    return CommonFormatterComposer;
  }
}

module.exports = FormatterComposerFactory;
