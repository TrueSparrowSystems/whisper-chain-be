/**
 * DISCLAIMER: This file is example of boilerplate code. Please check before using it for particular use-case.
 */
const rootPrefix = '../../../',
  ServiceBase = require(rootPrefix + '/app/services/Base'),
  UserModel = require(rootPrefix + '/app/models/mysql/user/User'),
  UsersByIdsCache = require(rootPrefix + '/lib/cacheManagement/multi/user/UsersByIds'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  bgJob = require(rootPrefix + '/lib/rabbitMqEnqueue/bgJob'),
  bgJobConstants = require(rootPrefix + '/lib/globalConstant/bgJob'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  paginationConstants = require(rootPrefix + '/lib/globalConstant/pagination');

/**
 * Class to fetch all active users.
 *
 * @class GetAllUsers
 */
class GetAllUsers extends ServiceBase {
  /**
   * Constructor to fetch all active users.
   *
   * @param {object} params
   * @param {string} params.api_source
   * @param {string} [params.pagination_identifier]
   *
   * @constructor
   */
  constructor(params) {
    super(params);

    const oThis = this;

    oThis.paginationIdentifier = params[paginationConstants.paginationIdentifierKey] || null;

    oThis.apiSource = params.api_source;

    oThis.paginationDatabaseId = null;

    oThis.userIds = [];
    oThis.users = {};

    oThis.responseMetaData = {};
    oThis.nextPageDatabaseId = null;

    oThis.limit = 2;
  }

  /**
   * Async perform.
   *
   * @returns {Promise<*>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    await oThis._validateAndSanitize();

    await oThis._fetchUsers();

    await bgJob.enqueue(bgJobConstants.getAllUsersTopic, {
      apiSource: oThis.apiSource
    });

    oThis._addResponseMetaData();

    return oThis._prepareResponse();
  }

  /**
   * Validate params.
   *
   * @private
   */
  _validateAndSanitize() {
    const oThis = this;

    if (oThis.paginationIdentifier) {
      const paginationParams = oThis._parsePaginationParams(oThis.paginationIdentifier);
      oThis.paginationDatabaseId = Number(paginationParams.next_page_database_id);
    }
  }

  /**
   * Fetch users.
   *
   * @sets oThis.userIds, oThis.users, oThis.nextPageDatabaseId
   *
   * @returns {Promise<void>}
   * @private
   */
  async _fetchUsers() {
    const oThis = this;

    const usersResponse = await new UserModel().fetchAllActiveUsersWithPagination({
        limit: oThis.limit,
        paginationDatabaseId: oThis.paginationDatabaseId
      }),
      userIds = usersResponse.userIds || [],
      nextPageDatabaseId = usersResponse.nextPageDatabaseId;

    if (userIds.length == 0) {
      return;
    }

    const cacheResponse = await new UsersByIdsCache({ ids: userIds }).fetch();
    if (cacheResponse.isFailure()) {
      return Promise.reject(cacheResponse);
    }

    oThis.userIds = userIds;
    oThis.users = cacheResponse.data;
    oThis.nextPageDatabaseId = nextPageDatabaseId;
  }

  /**
   * Add next page meta data.
   *
   * @sets oThis.responseMetaData
   *
   * @returns {void}
   * @private
   */
  _addResponseMetaData() {
    const oThis = this;

    const nextPagePayload = {};

    if (oThis.userIds.length >= oThis.limit) {
      nextPagePayload[paginationConstants.paginationIdentifierKey] = {
        next_page_database_id: oThis.nextPageDatabaseId
      };
    }

    oThis.responseMetaData = {
      [paginationConstants.nextPagePayloadKey]: nextPagePayload
    };
  }

  /**
   * Prepare service response.
   *
   * @returns {*|result}
   * @private
   */
  _prepareResponse() {
    const oThis = this;

    return responseHelper.successWithData({
      [entityTypeConstants.userIds]: oThis.userIds,
      [entityTypeConstants.usersMap]: oThis.users,
      meta: oThis.responseMetaData
    });
  }
}

module.exports = GetAllUsers;
