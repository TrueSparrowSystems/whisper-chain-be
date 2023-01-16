const rootPrefix = '../../../..',
  BaseFormatter = require(rootPrefix + '/lib/formatter/Base'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 * Class for ipfs objects formatter.
 *
 * @class IPFSObjects
 */
class IPFSObjects extends BaseFormatter {
  /**
   * Constructor for IPFS formatter.
   *
   * @param {object} params
   * @param {Array} params.id
   * @param {Array} params.uts
   * @param {Array} params.cid
   * @param {Array} params.entityKind
   * @param {Array} params.entityId
   *
   * @augments BaseFormatter
   *
   * @constructor
   */
  constructor(params) {
    super();

    const oThis = this;

    oThis.id = params.id;
    oThis.cid = params.cid;
    oThis.entityId = params.entityId;
    oThis.entityKind = params.entityKind;
    oThis.uts = params.uts;
  }

  /**
   * Format the input object.
   *
   * @returns {*|result}
   * @private
   */
  _format() {
    const oThis = this;

    return responseHelper.successWithData({
      id: oThis.id,
      cid: oThis.cid,
      entity_kind: oThis.entityKind,
      entity_id: oThis.entityId,
      uts: oThis.uts
    });
  }

  /**
   * Validate
   *
   * @param formattedEntity
   * @returns {*|result}
   * @private
   */
  _validate(formattedEntity) {
    const oThis = this;

    return oThis._validateSingle(formattedEntity);
  }

  /**
   * Schema
   *
   * @returns {{type: object, properties: {id: {description: string, type: string, example: number}, uts: {type: string, example: number}, cid: {type: string, example: string}, entity_kind: {type: string, example: number}, entity_id: {type: string, example: number}, required: [string, string, string, string, string]}}}
   */
  static schema() {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
          description: 'This is the id of ipfs object table'
        },
        uts: {
          type: 'integer',
          example: 1651666861
        },
        cid: {
          type: 'string',
          example: '123abc123'
        },
        entity_kind: {
          type: 'integer',
          example: 1
        },
        entity_id: {
          type: 'integer',
          example: 10
        }
      },
      required: ['id', 'uts', 'cid', 'entity_kind', 'entity_id']
    };
  }
}

module.exports = IPFSObjects;
