/**
 * Cron to fetch user details.
 *
 * Example: node executables/fetchUserDetails.js --cronProcessId Id
 *
 * @module executables/fetchUserDetails.js
 */

const program = require('commander');

const rootPrefix = '..',
  CronBase = require(rootPrefix + '/executables/CronBase'),
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses');

program.option('--cronProcessId <cronProcessId>', 'Cron table process ID').parse(process.argv);

program.on('--help', function() {
  logger.log('');
  logger.log('  Example:');
  logger.log('');
  logger.log('    node executables/fetchUserDetails.js --cronProcessId Id');
  logger.log('');
  logger.log('');
});

const cronProcessId = +program.opts().cronProcessId;
const limit = 10;

if (!cronProcessId) {
  program.help();
  process.exit(1);
}

/**
 * Class to fetch user details.
 *
 * @class FetchUserDetails
 */
class FetchUserDetails extends CronBase {
  /**
   * Constructor
   *
   * @augments CronBase
   *
   * @constructor
   */
  constructor() {
    const params = { cronProcessId: cronProcessId };

    super(params);

    const oThis = this;

    oThis.canExit = true;
  }

  /**
   * Start the executable.
   *
   * @returns {Promise<any>}
   * @private
   */
  async _start() {
    const oThis = this;

    let iteration = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const offset = iteration * limit;

      if (oThis.stopPickingUpNewWork) {
        oThis.canExit = true;
        break;
      }

      oThis.canExit = false;

      const userDetails = await oThis._fetchUserDetails(offset);

      if (userDetails.length <= 0) {
        oThis.canExit = true;
        break;
      }
      iteration += 1;

      logger.log('Iteration done::::', iteration);

      await basicHelper.sleep(1000);
    }
  }

  /**
   * Fetch user details
   *
   * @param offset
   * @returns {Promise<[]>}
   * @private
   */
  async _fetchUserDetails(offset) {
    const dbRows = await new UserModel()
      .select('*')
      .limit(limit)
      .offset(offset)
      .fire();

    const userDetails = [];
    for (let index = 0; index < dbRows.length; index++) {
      const formatDbRow = new UserModel().safeFormattedData(dbRows[index]);
      userDetails.push(formatDbRow);
      logger.log(formatDbRow);
    }

    return userDetails;
  }

  /**
   * Validate and sanitize.
   *
   * @private
   */
  _validateAndSanitize() {
    // Do nothing
  }

  /**
   * This function provides info whether the process has to exit.
   *
   * @private
   */
  _pendingTasksDone() {
    const oThis = this;

    return oThis.canExit;
  }

  /**
   * Cron kind
   *
   * @private
   */
  get _cronKind() {
    return cronProcessesConstants.fetchUserDetails;
  }
}

const performerObj = new FetchUserDetails({ cronProcessId: +cronProcessId });

performerObj
  .perform()
  .then(function() {
    logger.step('** Exiting process');
    logger.info('Cron last run at: ', Date.now());
    process.emit('SIGINT');
  })
  .catch(function(err) {
    logger.error('** Exiting process due to Error: ', err);
    process.emit('SIGINT');
  });
