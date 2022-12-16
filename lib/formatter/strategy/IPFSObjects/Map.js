const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  CommonValidators = require(rootPrefix + '/lib/validators/Common'),
  IPFSObjectsSingleFormatter = require(rootPrefix + '/lib/formatter/strategy/IPFSObjects/Single'),
  responseHelper = require(rootPrefix + '/lib/formatter/response'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

/**
 * Class for ipfs objects map formatter.
 *
 * @class IPFSObjectsMapFormatter
 */
class IPFSObjectsMapFormatter extends BaseFormatter {
  /**
   * Constructor for ipfs objects map formatter.
   *
   * @param {object} params
   * @param {object} params.ipfsObjects
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.ipfsObjectsByIdMap = params[entityTypeConstants.ipfsObjects];
  }

  /**
   * Format the input object.
   *
   * @returns {result}
   * @private
   */
  _format() {
    const oThis = this;

    const finalResponse = {};

    for (const ipfsObject in oThis.ipfsObjectsByIdMap) {
      const ipfsObjectRecord = oThis.ipfsObjectsByIdMap[ipfsObject];

      const formattedIpfsObject = new IPFSObjectsSingleFormatter({
        id: ipfsObjectRecord.id,
        uts: ipfsObjectRecord.uts,
        cid: ipfsObjectRecord.cid,
        entityKind: ipfsObjectRecord.entityKind,
        entityId: ipfsObjectRecord.entityId
      }).perform();

      if (formattedIpfsObject.isFailure()) {
        return formattedIpfsObject;
      }

      finalResponse[ipfsObjectRecord.id] = formattedIpfsObject.data;
    }

    return responseHelper.successWithData(finalResponse);
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    if (!CommonValidators.validateObject(formattedEntity)) {
      return responseHelper.error({
        internal_error_identifier: 'l_f_s_i_m_v_1',
        api_error_identifier: 'entity_formatting_failed',
        debug_options: {
          object: formattedEntity
        }
      });
    }

    return responseHelper.successWithData({});
  }

  static schema() {
    // We will need to construct an example for the map
    const singleSchema = IPFSObjectsSingleFormatter.schema();
    const singleExample = {};
    for (const prop in singleSchema.properties) {
      singleExample[prop] = singleSchema.properties[prop].example;
    }

    return {
      type: 'object',
      additionalProperties: IPFSObjectsSingleFormatter.schema(),
      example: {
        [singleExample.id]: singleExample
      }
    };
  }
}

module.exports = IPFSObjectsMapFormatter;
