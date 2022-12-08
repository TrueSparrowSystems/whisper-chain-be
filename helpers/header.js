/**
 * Class for header helpers.
 *
 * @class HeaderHelper
 */
class HeaderHelper {
  deviceId(headers) {
    return headers['x-app-device-id'] || '';
  }

  buildNumber(headers) {
    return Number(headers['x-app-build-number'] || 0);
  }

  appVersion(headers) {
    return headers['x-app-version'] || '';
  }

  deviceOs(headers) {
    const oThis = this,
      deviceOs = headers['x-app-device-os'];

    return deviceOs ? (oThis.isAllowedIosSubKind[deviceOs.toLowerCase()] ? 'ios' : deviceOs) : '';
  }

  deviceOsSubKind(headers) {
    const oThis = this,
      deviceOsSubKind = headers['x-app-device-os'];

    return oThis.isAllowedIosSubKind[deviceOsSubKind.toLowerCase()] ? deviceOsSubKind : null;
  }

  deviceOsVersion(headers) {
    return headers['x-app-os-version'] || '';
  }

  deviceUuid(headers) {
    return headers['x-app-device-uuid'] || '';
  }

  deviceType(headers) {
    return headers['x-app-device-type'] || '';
  }

  deviceTimezone(headers) {
    return headers['x-app-device-timezone'] || ''; // Default timezone ?
  }

  deviceManufacturer(headers) {
    return headers['x-app-device-manufacturer'] || '';
  }

  deviceHasNotch(headers) {
    return headers['x-app-device-has-notch'] || '';
  }

  locationCity(headers) {
    return headers['x-app-device-city'] || '';
  }

  deviceLatitude(headers) {
    return (headers || {})['x-app-device-latitude'] || '';
  }

  deviceLongitude(headers) {
    return (headers || {})['x-app-device-longitude'] || '';
  }

  ipCity(headers) {
    return (headers || {}).city || '';
  }

  ipStateCode(headers) {
    return (headers || {}).statecode || '';
  }

  ipCountryCode(headers) {
    return (headers || {}).countrycode || '';
  }

  locationCountry(headers) {
    return headers['x-app-device-country'] || '';
  }

  locationCountryCode(headers) {
    return headers['x-app-device-countrycode'] || '';
  }

  locationState(headers) {
    return headers['x-app-device-state'] || '';
  }

  locationStateCode(headers) {
    return headers['x-app-device-statecode'] || '';
  }

  get isAllowedIosSubKind() {
    const oThis = this;

    return {
      [oThis.iPadOsDeviceOs]: 1,
      [oThis.iPhoneOsDeviceOs]: 1
    };
  }

  get androidDeviceOs() {
    return 'android';
  }

  get iosDeviceOs() {
    return 'ios';
  }

  // For newer ipad os
  get iPadOsDeviceOs() {
    return 'ipados';
  }

  // For older iphone os/ipad os
  get iPhoneOsDeviceOs() {
    return 'iphone os';
  }
}

module.exports = new HeaderHelper();
