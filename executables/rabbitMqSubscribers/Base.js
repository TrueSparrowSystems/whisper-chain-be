const Base = require('@moxiedotxyz/base');

const rootPrefix = '../..',
  CronBase = require(rootPrefix + '/executables/CronBase'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  errorLogsConstants = require(rootPrefix + '/lib/globalConstant/errorLogs'),
  RabbitmqSubscription = require(rootPrefix + '/lib/entity/RabbitSubscription'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  createErrorLogsEntry = require(rootPrefix + '/lib/errorLogs/createEntry');

/**
 * Class for rabbitMq processor base.
 *
 * @class ProcessorBase
 */
class ProcessorBase extends CronBase {
  /**
   * Constructor for rabbitMq processor base.
   *
   * @param {object} params
   * @param {number} params.cronProcessId
   *
   * @augments CronBase
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.subscriptionTopicToDataMap = {};
  }

  /**
   * Start the actual functionality of the cron.
   *
   * @returns {Promise<boolean>}
   *
   * @private
   */
  async _start() {
    const oThis = this;

    oThis._prepareSubscriptionData();

    await oThis._startSubscription();

    return true;
  }

  /**
   * Validate and sanitize params.
   *
   * @sets oThis.prefetchCount
   *
   * @private
   */
  _validateAndSanitize() {
    const oThis = this;

    if (!oThis.prefetchCount) {
      const errMsg = 'Prefetch count un-available in cron params in the database.';
      logger.error(errMsg);

      return Promise.reject(errMsg);
    }

    oThis.prefetchCount = parseInt(oThis.prefetchCount);

    if (!CommonValidators.validateNonZeroInteger(oThis.prefetchCount)) {
      const errMsg = 'Prefetch count is not a valid integer.';
      logger.error(errMsg);

      return Promise.reject(errMsg);
    }

    logger.step('Common validations done.');
  }

  /**
   * Get promise queue manager for subscription topic.
   *
   * @param subscriptionTopic {string}
   * @return {*}
   */
  promiseQueueManager(subscriptionTopic) {
    const oThis = this;

    const rabbitmqSubscription = oThis.subscriptionTopicToDataMap[subscriptionTopic];

    // Trying to ensure that there is only one PromiseQueueManager.
    if (rabbitmqSubscription.promiseQueueManager) {
      return rabbitmqSubscription.promiseQueueManager;
    }

    const qm = new Base.MoxiePromise.QueueManager(
      function(...args) {
        /*
        Promise executor should be a static method by itself. We declared an unnamed function
        which was a static method, and promiseExecutor was passed in the same scope as that
        of the class with oThis preserved.
         */
        oThis._promiseExecutor(...args);
      },
      {
        name: `${oThis.cronProcessId}_promise_queue_manager`,
        timeoutInMilliSecs: oThis.timeoutInMilliSecs,
        rejectPromiseOnTimeout: true,
        onPromiseTimedout: function(promiseContext) {
          return oThis._onPromiseTimedout(promiseContext);
        }
      }
    );

    rabbitmqSubscription.setPromiseQueueManager(qm);

    return rabbitmqSubscription.promiseQueueManager;
  }

  /**
   * Callback to be executed in case of promise time out.
   *
   * @param {object} promiseContext
   *
   * @private
   */
  _onPromiseTimedout(promiseContext) {
    const oThis = this;

    logger.error(`${oThis.cronProcessId}_promise_queue_manager:: a promise has timed out.`);

    const errorObject = responseHelper.error({
      internal_error_identifier: 'promise_timedout:e_rms_b_1',
      api_error_identifier: 'promise_timedout',
      debug_options: {
        cronProcessId: oThis.cronProcessId,
        cronName: oThis._cronKind,
        executorParams: promiseContext.executorParams
      }
    });

    createErrorLogsEntry.perform(errorObject, errorLogsConstants.highSeverity);
  }

  /**
   * Start subscription.
   *
   * @return {Promise<void>}
   *
   * @private
   */
  async _startSubscription() {
    const oThis = this;

    for (let index = 0; index < oThis.topics.length; index++) {
      const subscriptionTopic = oThis.topics[index];

      const rabbitMqSubscription = oThis.subscriptionTopicToDataMap[subscriptionTopic];

      const notification = await oThis.getRmqProvider();

      // Below condition is to save from multiple subscriptions by command messages.
      if (!rabbitMqSubscription.isSubscribed()) {
        rabbitMqSubscription.markAsSubscribed();

        oThis.promiseQueueManager(subscriptionTopic);

        if (rabbitMqSubscription.consumerTag) {
          process.emit('RESUME_CONSUME', rabbitMqSubscription.consumerTag);
        } else {
          notification.subscribeEvent
            .rabbit(
              [rabbitMqSubscription.topic],
              {
                queue: rabbitMqSubscription.queue,
                ackRequired: oThis.ackRequired,
                prefetch: rabbitMqSubscription.prefetchCount
              },
              function(params) {
                let messageParams = {};
                try {
                  messageParams = JSON.parse(params);
                } catch (err) {
                  logger.error('--------Parsing failed--------------params-----', params);

                  return Promise.resolve({});
                }

                return oThis
                  ._sequentialExecutor(messageParams)
                  .then(
                    function(response) {
                      if (response.isFailure()) {
                        return Promise.resolve({});
                      }

                      return rabbitMqSubscription.promiseQueueManager.createPromise(messageParams);
                    },
                    function(err) {
                      logger.error('---------------------reject err------', err.toString());

                      return Promise.resolve({});
                    }
                  )
                  .catch(function(error) {
                    logger.error('Error in subscription', error);

                    return Promise.resolve({});
                  });
              },
              function(consumerTag) {
                rabbitMqSubscription.setConsumerTag(consumerTag);
              }
            )
            .catch(function(error) {
              logger.error('Error in subscription', error);
              oThis._rmqError();
            });
        }
      }
    }
  }

  /**
   * This method executes the promises.
   *
   * @param {function} onResolve
   * @param {function} onReject
   * @param {object} messageParams
   *
   * @returns {*}
   *
   * @private
   */
  _promiseExecutor(onResolve, onReject, messageParams) {
    const oThis = this;

    oThis
      ._processMessage(messageParams)
      .then(function() {
        onResolve();
      })
      .catch(async function(err) {
        return oThis._handleError(onResolve, onReject, messageParams, err);
      });
  }

  /**
   * This method processes the error
   *
   * @param {function} onResolve
   * @param {function} onReject
   * @param {object} messageParams
   * @param {object} err
   *
   * @returns {*}
   *
   * @private
   */
  async _handleError(onResolve, onReject, messageParams, err) {
    let errorObject = err;
    logger.error('e_rms_b_2', 'Error in process message from rmq.', 'Error: ', err, 'Params: ', messageParams);
    if (!responseHelper.isCustomResult(err)) {
      errorObject = responseHelper.error({
        internal_error_identifier: 'unhandled_catch_response:e_rms_b_2',
        api_error_identifier: 'unhandled_catch_response',
        debug_options: { error: err.toString(), stack: err.stack }
      });
    }
    logger.error(' In catch block of executables/rabbitMqSubscribers/Base.js', err);
    await createErrorLogsEntry.perform(errorObject, errorLogsConstants.highSeverity);
    process.emit('SIGINT');
    onResolve();
  }

  /**
   * Rmq error.
   *
   * @param {object} err
   *
   * @private
   */
  _rmqError(err) {
    logger.info('RmqError occurred.', err);
    process.emit('SIGINT');
  }

  /**
   * This function checks if there are any pending tasks left or not.
   *
   * @returns {Boolean}
   */
  _pendingTasksDone() {
    const oThis = this;

    for (const topic in oThis.subscriptionTopicToDataMap) {
      const rabbitmqSubscription = oThis.subscriptionTopicToDataMap[topic];

      if (!rabbitmqSubscription.promiseQueueManager) {
        continue;
      }

      const pendingTaskCount = rabbitmqSubscription.promiseQueueManager.getPendingCount();

      if (Number(pendingTaskCount) !== 0) {
        logger.info('Waiting for pending tasks. Count:', pendingTaskCount);

        return false;
      }
    }

    return true;
  }

  /**
   * Stops consumption upon invocation.
   *
   * @private
   */
  _stopPickingUpNewTasks() {
    const oThis = this;

    // Stopping consumption for all the topics.
    for (const topic in oThis.subscriptionTopicToDataMap) {
      const rabbitmqSubscription = oThis.subscriptionTopicToDataMap[topic];

      rabbitmqSubscription.stopConsumption();
    }
  }

  /**
   * Timeout in milli seconds.
   *
   * @returns {number}
   */
  get timeoutInMilliSecs() {
    return 3 * 60 * 1000; // By default the time out is 3 minutes.
  }

  /**
   * Ack required.
   *
   * @returns {number}
   */
  get ackRequired() {
    return 1;
  }

  /**
   * Sequential executor.
   *
   * @param {object} messageParams
   *
   * @returns {Promise<void>}
   * @private
   */

  // eslint-disable-next-line no-unused-vars
  async _sequentialExecutor(messageParams) {
    // Default behaviour - nothing to do.
    return responseHelper.successWithData({});
  }

  /**
   * On max zombie count reached.
   *
   * @private
   */
  _onMaxZombieCountReached() {
    logger.warn('e_rms_b_3', 'maxZombieCount reached. Triggering SIGTERM.');
    // Trigger gracefully shutdown of process.
    process.kill(process.pid, 'SIGTERM');
  }

  /**
   * Prepare subscription data.
   *
   * @returns {{}}
   * @private
   */
  _prepareSubscriptionData() {
    const oThis = this;

    for (let index = 0; index < oThis.topics.length; index++) {
      const topic = oThis.topics[index],
        queueSuffix = oThis.queues[index]; // Parameter 'queues' is coming from input parameters.

      oThis.subscriptionTopicToDataMap[topic] = new RabbitmqSubscription({
        topic: topic,
        queue: oThis._queuePrefix + queueSuffix,
        prefetchCount: oThis.prefetchCount
      });
    }
  }

  /**
   * Process message.
   *
   * @param {object} messageParams
   * @param {string} messageParams.kind
   * @param {object} messageParams.payload
   *
   * @returns {Promise<>}
   *
   * @private
   */
  async _processMessage(messageParams) {
    const oThis = this;

    logger.log('Message params =====', messageParams);

    return oThis.jobProcessorFactory.getInstance(messageParams).perform();
  }

  /**
   * Get cron kind.
   *
   * @returns {string}
   * @private
   */
  get _cronKind() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Get rabbitMq config kind.
   *
   * @returns {string}
   * @private
   */
  getRmqProvider() {
    throw new Error('Sub-class to implement.');
  }

  /**
   * Returns job processor factory.
   *
   * @returns {any}
   */
  get jobProcessorFactory() {
    throw new Error('Sub-class to implement.');
  }
}

logger.step('RabbitMq ProcessorBase Factory started.');

module.exports = ProcessorBase;
