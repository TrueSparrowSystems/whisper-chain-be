const rootPrefix = '../../..',
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');
/**
 * Class for get all users sample job.
 *
 * @class GetAllUserSampleJob
 */
class GetAllUserSampleJob {
  /**
   * Constructor to get all users sample job.
   *
   * @param {object} params
   * @param {string} params.apiSource
   *
   * @constructor
   */
  constructor(params) {
    const oThis = this;

    oThis.apiSource = params.apiSource;
  }

  /**
   * Main performer for class.
   *
   * @returns {Promise<void>}
   */
  async perform() {
    const oThis = this;

    await oThis._fetchUserIdsAndLog();
  }

  /**
   * Fetch all users with pagination and log.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _fetchUserIdsAndLog() {
    const oThis = this;

    const usersResponse = await new UserModel().fetchAllActiveUsersWithPagination({
        limit: 100,
        paginationDatabaseId: oThis.paginationDatabaseId
      }),
      userIds = usersResponse.userIds || [];

    if (userIds.length == 0) {
      return;
    }

    logger.info(` ***** For ${oThis.apiSource} ***** `);
    logger.info(' ****** Logging all user Ids ****** ');
    logger.log(` ****** ${userIds} ****** `);
    logger.win(' ****** Logged all user Ids ****** ');
  }
}

module.exports = GetAllUserSampleJob;
