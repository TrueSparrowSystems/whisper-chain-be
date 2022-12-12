const rootPrefix = '../../..',
  BaseComposer = require(rootPrefix + '/lib/formatter/composer/Base'),
  EntityIntIdListFormatter = require(rootPrefix + '/lib/formatter/strategy/EntityIntIdList'),
  UserMapFormatter = require(rootPrefix + '/lib/formatter/strategy/user/Map'),
  GetAllUsersListMetaFormatter = require(rootPrefix + '/lib/formatter/meta/GetAllUsersList'),
  S3Formatter = require(rootPrefix + '/lib/formatter/strategy/S3/Single'),
  IPFSMetadataFormatter = require(rootPrefix + '/lib/formatter/strategy/IPFSMetadata/Single'),
  UploadParamsMapFormatter = require(rootPrefix + '/lib/formatter/strategy/uploadParams/Map'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType');

// Add your entity type here with entity formatter class name.
const entityClassMapping = {
  // Following entities are for example only,
  [entityTypeConstants.userIds]: EntityIntIdListFormatter,
  [entityTypeConstants.usersMap]: UserMapFormatter,
  [entityTypeConstants.getAllUsersListMeta]: GetAllUsersListMetaFormatter,
  [entityTypeConstants.uploadParams]: UploadParamsMapFormatter,
  [entityTypeConstants.s3]: S3Formatter,
  [entityTypeConstants.ipfsMetaData]: IPFSMetadataFormatter
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
