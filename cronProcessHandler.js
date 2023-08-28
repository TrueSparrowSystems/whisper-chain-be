const rootPrefix = '.',
  dailyPostPublicationCron = require(rootPrefix + '/lib/cron/dailyPostPublication'),
  seedImageCron = require(rootPrefix + '/lib/cron/seedImage'),
  whisperStatusPollingCron = require(rootPrefix + '/lib/cron/whisperStatusPolling');

// This is the Lambda handler function
exports.handler = async (event, context) => {
  try {
    // Extract data from the event object
    console.log('event', JSON.stringify(event));
    console.log('context', JSON.stringify(context));
    const asyncProcessType = event.async_process_type;

    if (asyncProcessType == 'daily_post_publication_scheduler') {
      await new dailyPostPublicationCron().perform();
    } else if (asyncProcessType == 'seed_image_scheduler') {
      await new seedImageCron().perform();
    } else if (asyncProcessType == 'whisper_status_polling_scheduler') {
      await new whisperStatusPollingCron().perform();
    }

    // Return a response
    return {
      statusCode: 200,
      body: JSON.stringify({})
    };
  } catch (error) {
    // Handle any errors that occur during processing
    logger.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
