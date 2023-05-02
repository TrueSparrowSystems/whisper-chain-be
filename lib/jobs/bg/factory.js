const rootPrefix = '../../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class for background job processor factory.
 *
 * @class Factory
 */
class Factory {
  /**
   * Get factory instance.
   *
   * @param {object} messageParams
   *
   * @returns {oject}
   */
  getInstance(messageParams) {
    logger.log('Background job factory get instance.', messageParams);

    switch (messageParams.message.kind) {
      default: {
        throw new Error(`Unrecognized messageParams: ${JSON.stringify(messageParams)}`);
      }
    }
  }
}

module.exports = new Factory();
