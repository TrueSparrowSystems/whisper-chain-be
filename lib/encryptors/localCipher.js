const crypto = require('crypto');

// Declare variables.
const algorithm = 'aes-256-cbc';

/**
 * Class for local cipher to encrypt and decrypt client keys.
 *
 * @class LocalCipher
 */
class LocalCipher {
  /**
   * Encrypt the input string.
   *
   * @param {string} salt
   * @param {string} string
   *
   * @returns {string}
   */
  encrypt(salt, string) {
    const encrypt = crypto.createCipher(algorithm, salt);
    let theCipher = encrypt.update(string, 'utf8', 'hex');
    theCipher += encrypt.final('hex');

    return theCipher;
  }

  /**
   * Decrypt the input encrypted string.
   *
   * @param {string} salt
   * @param {string} encryptedString
   *
   * @returns {string}
   */
  decrypt(salt, encryptedString) {
    const decrypt = crypto.createDecipher(algorithm, salt);
    let string = decrypt.update(encryptedString, 'hex', 'utf8');
    string += decrypt.final('utf8');

    return string;
  }

  /**
   * Generate API signature.
   *
   * @param {string} stringParams
   * @param {string} clientSecret
   *
   * @returns {string}
   */
  generateApiSignature(stringParams, clientSecret) {
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(stringParams);

    return hmac.digest('hex');
  }

  /**
   * Generate random IV.
   *
   * @param {number} number
   *
   * @returns {string}
   */
  generateRandomIv(number) {
    const iv = new Buffer.from(crypto.randomBytes(number));

    return iv.toString('hex').slice(0, number);
  }

  /**
   * Generate random salt
   *
   * @returns {string}
   */
  generateRandomSalt() {
    return crypto.randomBytes(16).toString('hex');
  }
}

module.exports = new LocalCipher();
