const rootPrefix = '../../..',
  HttpLibrary = require(rootPrefix + '/lib/HttpRequest'),
  CreateSignature = require(rootPrefix + '/lib/email/services/CreateSignature'),
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  emailServiceApiCallHookConstants = require(rootPrefix + '/lib/globalConstant/big/emailServiceApiCallHook'),
  pepoCampaignsConstants = require(rootPrefix + '/lib/globalConstant/pepoCampaigns');

/**
 * Class for pepo-campaigns sdk.
 *
 * @class PepoCampaigns
 */
class PepoCampaigns {
  /**
   * Get formatted query params.
   *
   * @param {string} resource: API Resource
   * @param {object} queryParams: resource query parameters
   * @param {string} pepoCampaignsAccountKind: Pepo campaigns account kind
   *
   * @returns {object}: query parameters with signature
   * @private
   */
  _formatQueryParams(resource, queryParams, pepoCampaignsAccountKind) {
    const oThis = this;

    const signatureResult = CreateSignature.baseParams(
      resource,
      queryParams,
      oThis.apiClientSecret(pepoCampaignsAccountKind)
    );

    queryParams['api-key'] = oThis.apiClientKey(pepoCampaignsAccountKind);
    queryParams.signature = signatureResult.signature;
    queryParams['request-time'] = signatureResult.requestTime;

    return queryParams;
  }

  /**
   * Send transactional email.
   *
   * @param email
   * @param template
   * @param emailVars
   * @param pepoCampaignsAccountKind
   * @returns {Promise<void>}
   */
  async sendTransactionalMail(email, template, emailVars, pepoCampaignsAccountKind = null) {
    const oThis = this;

    const endpoint = `/api/${pepoCampaignsConstants.pepoCampaignsAPIVersion}/send/`,
      requestParams = {
        email: email,
        template: template,
        email_vars: JSON.stringify(emailVars)
      };

    return oThis.makeRequest('POST', endpoint, requestParams, pepoCampaignsAccountKind);
  }

  /**
   * Add contact.
   *
   * @param {string/number} listId
   * @param {string} email
   * @param {object} attributes
   * @param {object} userStatus
   *
   * @returns {Promise<void>}
   */
  async addContact(listId, email, attributes, userStatus) {
    const oThis = this;

    const endpoint = `/api/${pepoCampaignsConstants.pepoCampaignsAPIVersion}/list/${listId}/add-contact/`,
      requestParams = {
        email: email,
        attributes: attributes,
        user_status: userStatus
      };

    return oThis.makeRequest('POST', endpoint, requestParams);
  }

  /**
   * Update contact attributes.
   *
   * @param {string/number} listId
   * @param {string} email
   * @param {object} attributes
   *
   * @returns {Promise<void>}
   */
  async updateContactAttributes(listId, email, attributes) {
    const oThis = this;

    const endpoint = `/api/${pepoCampaignsConstants.pepoCampaignsAPIVersion}/list/${listId}/add-contact/`,
      requestParams = {
        email: email,
        attributes: attributes,
        user_status: {}
      };

    return oThis.makeRequest('POST', endpoint, requestParams);
  }

  /**
   * Change contact status in pepo campaigns.
   *
   * @param email
   * @param status - "unsubscribe" | "resubscribe"
   *
   * @returns {Promise<void>}
   */
  async changeContactStatus(email, status) {
    const oThis = this;

    const endpoint = `/api/${pepoCampaignsConstants.pepoCampaignsAPIVersion}/user/change-status/`,
      requestParams = {
        email: email,
        type: status
      };

    return oThis.makeRequest('POST', endpoint, requestParams);
  }

  /**
   * Remove contact from pepo campaigns list
   *
   * @param listId
   * @param email
   *
   * @returns {Promise<void>}
   */
  async removeContact(listId, email) {
    const oThis = this;

    const endpoint = `/api/${pepoCampaignsConstants.pepoCampaignsAPIVersion}/list/${listId}/remove-contact/`,
      requestParams = {
        email: email
      };

    return oThis.makeRequest('POST', endpoint, requestParams);
  }

  /**
   * Make request.
   *
   * @param {string} requestType
   * @param {string} endpoint
   * @param {object} requestParams
   * @param {string} pepoCampaignsAccountKind
   *
   * @returns {Promise<void>}
   */
  async makeRequest(requestType, endpoint, requestParams, pepoCampaignsAccountKind = null) {
    const oThis = this,
      requestUrl = `${oThis.apiEndPoint(pepoCampaignsAccountKind)}${endpoint}`;

    const requestData = oThis._formatQueryParams(endpoint, requestParams, pepoCampaignsAccountKind);

    const HttpLibObj = new HttpLibrary({ resource: requestUrl });
    let responseData = {};

    if (requestType === 'GET') {
      responseData = await HttpLibObj.get(requestData).catch(function(err) {
        return err;
      });
    } else if (requestType === 'POST') {
      responseData = await HttpLibObj.post(requestData).catch(function(err) {
        return err;
      });
    } else {
      throw new Error('Invalid requestType.');
    }

    const res = JSON.parse(responseData.data.responseData);

    if (res.error) {
      return Promise.reject(res);
    }

    return responseHelper.successWithData(res.data);
  }

  /**
   * Various Pepo campaign account details
   *
   * @returns {{[p: string]: {clientKey: *, clientSecret: *, url: *}}}
   */
  get pepoCampaignsAccountDetails() {
    return {
      [emailServiceApiCallHookConstants.pepoCampaignBaseKind]: {
        url: coreConstants.PEPO_CAMPAIGN_BASE_URL.replace(/\/$/, ''),
        clientKey: coreConstants.PEPO_CAMPAIGN_CLIENT_KEY,
        clientSecret: coreConstants.PEPO_CAMPAIGN_CLIENT_SECRET
      }
    };
  }

  /**
   * Returns api End Point
   *
   * @param pepoCampaignsAccountKind
   * @returns {*}
   */
  apiEndPoint(pepoCampaignsAccountKind) {
    const oThis = this;

    pepoCampaignsAccountKind = pepoCampaignsAccountKind || emailServiceApiCallHookConstants.pepoCampaignBaseKind;

    return oThis.pepoCampaignsAccountDetails[pepoCampaignsAccountKind].url;
  }

  /**
   * Returns Api client key
   *
   * @param pepoCampaignsAccountKind
   * @returns {*}
   */
  apiClientKey(pepoCampaignsAccountKind) {
    const oThis = this;

    pepoCampaignsAccountKind = pepoCampaignsAccountKind || emailServiceApiCallHookConstants.pepoCampaignBaseKind;

    return oThis.pepoCampaignsAccountDetails[pepoCampaignsAccountKind].clientKey;
  }

  /**
   * Returns Api client secret
   *
   * @param pepoCampaignsAccountKind
   * @returns {*}
   */
  apiClientSecret(pepoCampaignsAccountKind) {
    const oThis = this;

    pepoCampaignsAccountKind = pepoCampaignsAccountKind || emailServiceApiCallHookConstants.pepoCampaignBaseKind;

    return oThis.pepoCampaignsAccountDetails[pepoCampaignsAccountKind].clientSecret;
  }
}

module.exports = new PepoCampaigns();
