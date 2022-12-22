const rootPrefix = '../../..',
  BaseComposer = require(rootPrefix + '/lib/formatter/composer/Base'),
  IPFSObjectsMapFormatter = require(rootPrefix + '/lib/formatter/strategy/IPFSObjects/Map'),
  entityTypeConstants = require(rootPrefix + '/lib/globalConstant/entityType'),
  SuggestionsMapFormatter = require(rootPrefix + '/lib/formatter/strategy/Suggestion/Map'),
  WhispersMapFormatter = require(rootPrefix + '/lib/formatter/strategy/Whisper/Map'),
  ChainsMapFormatter = require(rootPrefix + '/lib/formatter/strategy/Chain/Map'),
  UsersMapFormatter = require(rootPrefix + '/lib/formatter/strategy/User/Map'),
  currentUserFormatter = require(rootPrefix + '/lib/formatter/strategy/CurrentUser/Single'),
  ImagesMapFormatter = require(rootPrefix + '/lib/formatter/strategy/Image/Map'),
  EntityIntIdListFormatter = require(rootPrefix + '/lib/formatter/strategy/EntityIntIdList');

// Add your entity type here with entity formatter class name.
const entityClassMapping = {
  // Following entities are for example only,

  [entityTypeConstants.suggestions]: SuggestionsMapFormatter,
  [entityTypeConstants.suggestionsIds]: EntityIntIdListFormatter,
  [entityTypeConstants.ipfsObjects]: IPFSObjectsMapFormatter,
  [entityTypeConstants.ipfsObjectIds]: EntityIntIdListFormatter,
  [entityTypeConstants.chainIds]: EntityIntIdListFormatter,
  [entityTypeConstants.whisperIds]: EntityIntIdListFormatter,
  [entityTypeConstants.whispers]: WhispersMapFormatter,
  [entityTypeConstants.chains]: ChainsMapFormatter,
  [entityTypeConstants.users]: UsersMapFormatter,
  [entityTypeConstants.currentUser]: currentUserFormatter,
  [entityTypeConstants.images]: ImagesMapFormatter
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
