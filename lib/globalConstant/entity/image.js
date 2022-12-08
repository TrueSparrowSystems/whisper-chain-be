const rootPrefix = '../../..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  util = require(rootPrefix + '/lib/util');

let invertedStatuses, invertedResizeStatuses, invertedKinds, invertedResolutionKeyToShortMap, imageResizeSizes;

/**
 * Class for image constants
 *
 * @class ImageConstants
 */
class ImageConstants {
  get activeStatus() {
    return 'ACTIVE';
  }

  get deletedStatus() {
    return 'DELETED';
  }

  get statuses() {
    const oThis = this;

    return {
      '1': oThis.activeStatus,
      '2': oThis.deletedStatus
    };
  }

  get invertedStatuses() {
    const oThis = this;

    invertedStatuses = invertedStatuses || util.invert(oThis.statuses);

    return invertedStatuses;
  }

  get resizeDone() {
    return 'RESIZE_DONE';
  }

  get resizeStarted() {
    return 'RESIZE_STARTED';
  }

  get resizeFailed() {
    return 'RESIZE_FAILED';
  }

  get notResized() {
    return 'NOT_RESIZED';
  }

  get originalResolution() {
    return 'original';
  }

  get resizeStatuses() {
    const oThis = this;

    return {
      '1': oThis.notResized,
      '2': oThis.resizeStarted,
      '3': oThis.resizeDone,
      '4': oThis.resizeFailed
    };
  }

  get invertedResizeStatuses() {
    const oThis = this;

    invertedResizeStatuses = invertedResizeStatuses || util.invert(oThis.resizeStatuses);

    return invertedResizeStatuses;
  }

  get profileImageKind() {
    return 'PROFILE_IMAGE';
  }

  get kinds() {
    const oThis = this;

    return {
      '1': oThis.profileImageKind
    };
  }

  get invertedKinds() {
    const oThis = this;

    invertedKinds = invertedKinds || util.invert(oThis.kinds);

    return invertedKinds;
  }

  /**
   * Resolution map for constructing url.
   *
   * @returns {object}
   */
  get resolutionKeyToShortMap() {
    const oThis = this;

    return {
      [oThis.originalResolution]: 'o'
    };
  }

  get invertedResolutionKeyToShortMap() {
    const oThis = this;

    invertedResolutionKeyToShortMap = invertedResolutionKeyToShortMap || util.invert(oThis.resolutionKeyToShortMap);

    return invertedResolutionKeyToShortMap;
  }

  /**
   * Compression sizes for image resizer.
   *
   * @returns {object}
   */
  get compressionSizes() {
    return {};
  }

  get defaultImages() {
    const oThis = this;

    return {
      '-1': {
        id: '-1',
        resolutions: {
          original: {
            height: 256,
            width: 256,
            url: `${coreConstants.WEB_ASSET_CDN_URL}/assets/images/static/fallback-rbg-wf@2x.png?v=1`
          },
          x128: {
            height: 128,
            width: 128,
            url: `${coreConstants.WEB_ASSET_CDN_URL}/assets/images/static/fallback-rbg-wf.png?v=1`
          },
          '4X3': {
            height: 512,
            width: 384,
            url: `${coreConstants.WEB_ASSET_CDN_URL}/assets/images/static/fallback-rbg-wf-4x3@2x.png?v=1`
          }
        },
        status: oThis.activeStatus,
        createdAt: 1,
        updatedAt: 1
      }
    };
  }
}

module.exports = new ImageConstants();
