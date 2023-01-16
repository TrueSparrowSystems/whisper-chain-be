/**
 * Class for API names.
 *
 * @class ApiName
 */
class ApiName {
  /**
   * Get string value for suggestions.
   *
   * @returns {string}
   */
  get suggestions() {
    return 'suggestions';
  }

  /**
   * Get string value for IPFS MetaData.
   *
   * @returns {string}
   */
  get ipfsObjects() {
    return 'ipfsObjects';
  }

  /**
   * Get string value to create whisper.
   *
   * @returns {string}
   */
  get createWhisper() {
    return 'createWhisper';
  }

  /**
   * Get string value to fetch chains.
   *
   * @returns {string}
   */
  get fetchChains() {
    return 'fetchChains';
  }

  /* Get string value for whisper list.
   *
   * @returns {string}
   */
  get whispers() {
    return 'whispers';
  }

  /* Get string value for lens connect.
   *
   * @returns {string}
   */
  get lensConnect() {
    return 'lensConnect';
  }

  get logout() {
    return 'logout';
  }
}

module.exports = new ApiName();
