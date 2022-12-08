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
   * Get string value for email signup api.
   *
   * @returns {string}
   */
  get emailSignUp() {
    return 'emailSignUp';
  }

  /**
   * Get string value for get all users.
   *
   * @returns {string}
   */
  get getAllUsers() {
    return 'getAllUsers';
  }

  /**
   * Get string value for S3 upload params.
   *
   * @returns {string}
   */
  get uploadParams() {
    return 'uploadParams';
  }
}

module.exports = new ApiName();
