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

      case bgJobConstants.getAllUsersTopic: {
        return new oThis._getAllUsersTopic(messageParams.message.payload);
      }

      default: {
        throw new Error(`Unrecognized messageParams: ${JSON.stringify(messageParams)}`);
      }
    }
  }

  /**
   *
   * @returns {any}
   * @private
   */
  get _getAllUsersTopic() {
    return require(rootPrefix + '/lib/jobs/bg/GetAllUserSampleJob');
  }
}

module.exports = new Factory();
