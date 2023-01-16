const rootPrefix = '../../..',
  bgJobConstants = require(rootPrefix + '/lib/globalConstant/bgJob'),
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
    const oThis = this;

    logger.log('Background job factory get instance.', messageParams);

    switch (messageParams.message.kind) {
      // case 'testBgJobTopic': {
      //   // Call method here according to logic
      // }

      default: {
        throw new Error(`Unrecognized messageParams: ${JSON.stringify(messageParams)}`);
      }
    }
  }
}

module.exports = new Factory();
