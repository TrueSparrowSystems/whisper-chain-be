const rootPrefix = '../../..',
  BaseComposer = require(rootPrefix + '/lib/formatter/composer/Base'),
  UserMapFormatter = require(rootPrefix + '/lib/formatter/strategy/user/Map'),
  S3Formatter = require(rootPrefix + '/lib/formatter/strategy/S3/Single'),
  IPFSMetadataFormatter = require(rootPrefix + '/lib/formatter/strategy/IPFSMetadata/Single'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  SuggestionsMapFormatter = require(rootPrefix + '/lib/formatter/strategy/Suggestion/Map'),
  EntityIntIdListFormatter = require(rootPrefix + '/lib/formatter/strategy/EntityIntIdList');

// Add your entity type here with entity formatter class name.
const entityClassMapping = {
  // Following entities are for example only,
  [entityTypeConstants.usersMap]: UserMapFormatter,
  [entityTypeConstants.s3]: S3Formatter,
  [entityTypeConstants.ipfsMetadata]: IPFSMetadataFormatter,
  [entityTypeConstants.suggestions]: SuggestionsMapFormatter,
  [entityTypeConstants.suggestionsIds]: EntityIntIdListFormatter
};

class CommonFormatterComposer extends BaseComposer {
  /**
   * Entity class mapping
   *
   * @returns {{}}
   */
  static get entityClassMapping() {
    return entityClassMapping;
  }
}

module.exports = CommonFormatterComposer;
