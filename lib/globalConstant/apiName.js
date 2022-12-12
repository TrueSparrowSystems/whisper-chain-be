/**
 * Class for API names.
 *
 * @class ApiName
 */
class ApiName {
  // Following is a exmaple for api name declaration
  // get testApiName() {
  //   return 'testApiName';
  // }

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
  get ipfsMetaData() {
    return 'ipfsMetaData';
  }
}

module.exports = new ApiName();
