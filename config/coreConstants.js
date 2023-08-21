/* eslint-disable no-process-env */

/**
 * Class for core constants.
 *
 * @class CoreConstants
 */
class CoreConstants {
  get environment() {
    return process.env.A_ENVIRONMENT;
  }

  get port() {
    return process.env.A_PORT;
  }

  get dbSuffix() {
    return process.env.A_DB_SUFFIX;
  }

  get environmentShort() {
    return process.env.A_ENVIRONMENT.substring(0, 2);
  }

  // DevOps error logs framework details.
  get APP_NAME() {
    return process.env.A_DEVOPS_APP_NAME;
  }

  get ENV_IDENTIFIER() {
    return process.env.A_DEVOPS_ENV_ID;
  }

  get IP_ADDRESS() {
    return process.env.A_DEVOPS_IP_ADDRESS;
  }

  get WS_SERVER_IDENTIFIER() {
    return process.env.A_DEVOPS_SERVER_IDENTIFIER;
  }

  get DEFAULT_LOG_LEVEL() {
    return process.env.A_DEFAULT_LOG_LEVEL;
  }

  get API_DOMAIN() {
    return process.env.API_DOMAIN;
  }

  get A_COOKIE_DOMAIN() {
    return process.env.A_COOKIE_DOMAIN;
  }

  get A_COOKIE_TOKEN_SECRET() {
    return process.env.A_COOKIE_TOKEN_SECRET;
  }

  get API_COOKIE_SECRET() {
    return process.env.API_COOKIE_SECRET;
  }

  get V1_COOKIE_SECRET() {
    return process.env.A_V1_COOKIE_SECRET;
  }

  // MySql constants.
  get MYSQL_CONNECTION_POOL_SIZE() {
    return process.env.A_MYSQL_CONNECTION_POOL_SIZE;
  }

  // Main db
  get MAIN_DB_MYSQL_HOST() {
    return process.env.A_MAIN_DB_MYSQL_HOST;
  }

  get MAIN_DB_MYSQL_USER() {
    return process.env.A_MAIN_DB_MYSQL_USER;
  }

  get MAIN_DB_MYSQL_PASSWORD() {
    return process.env.A_MAIN_DB_MYSQL_PASSWORD;
  }

  get MAIN_DB_MYSQL_HOST_SLAVE() {
    return process.env.A_MAIN_DB_MYSQL_HOST_SLAVE;
  }

  get MAIN_DB_MYSQL_USER_SLAVE() {
    return process.env.A_MAIN_DB_MYSQL_USER_SLAVE;
  }

  get MAIN_DB_MYSQL_PASSWORD_SLAVE() {
    return process.env.A_MAIN_DB_MYSQL_PASSWORD_SLAVE;
  }

  // Config db.
  get CONFIG_DB_MYSQL_HOST() {
    return process.env.A_CONFIG_DB_MYSQL_HOST;
  }

  get CONFIG_DB_MYSQL_USER() {
    return process.env.A_CONFIG_DB_MYSQL_USER;
  }

  get CONFIG_DB_MYSQL_PASSWORD() {
    return process.env.A_CONFIG_DB_MYSQL_PASSWORD;
  }

  // Big db.
  get BIG_DB_MYSQL_HOST() {
    return process.env.A_BIG_DB_MYSQL_HOST;
  }

  get BIG_DB_MYSQL_USER() {
    return process.env.A_BIG_DB_MYSQL_USER;
  }

  get BIG_DB_MYSQL_PASSWORD() {
    return process.env.A_BIG_DB_MYSQL_PASSWORD;
  }

  // Entity db.
  get ENTITY_DB_MYSQL_HOST() {
    return process.env.A_ENTITY_DB_MYSQL_HOST;
  }

  get ENTITY_DB_MYSQL_USER() {
    return process.env.A_ENTITY_DB_MYSQL_USER;
  }

  get ENTITY_DB_MYSQL_PASSWORD() {
    return process.env.A_ENTITY_DB_MYSQL_PASSWORD;
  }

  // User db.
  get USER_DB_MYSQL_HOST() {
    return process.env.A_USER_DB_MYSQL_HOST;
  }

  get USER_DB_MYSQL_USER() {
    return process.env.A_USER_DB_MYSQL_USER;
  }

  get USER_DB_MYSQL_PASSWORD() {
    return process.env.A_USER_DB_MYSQL_PASSWORD;
  }

  get CONFIG_STRATEGY_SALT() {
    return process.env.A_CONFIG_STRATEGY_SALT;
  }

  get ENCRYPTION_KEY() {
    return process.env.A_ENCRYPTION_KEY;
  }

  get GLOBAL_ENCRYPTED_ENCRYPTION_SALT() {
    return process.env.GLOBAL_ENCRYPTED_ENCRYPTION_SALT;
  }

  // Pepo-campaigns details.
  get PEPO_CAMPAIGN_BASE_URL() {
    return process.env.A_CAMPAIGN_BASE_URL;
  }

  get PEPO_CAMPAIGN_CLIENT_KEY() {
    return process.env.A_CAMPAIGN_CLIENT_KEY;
  }

  get PEPO_CAMPAIGN_CLIENT_SECRET() {
    return process.env.A_CAMPAIGN_CLIENT_SECRET;
  }

  get PEPO_CAMPAIGN_MASTER_LIST() {
    return process.env.A_CAMPAIGN_MASTER_LIST;
  }

  get MIN_SUPPORTED_BUILD_NUMBER() {
    return JSON.parse(process.env.API_MIN_SUPPORTED_BUILD_NUMBER);
  }

  get MAX_DEPRECATED_BUILD_NUMBER() {
    return JSON.parse(process.env.API_MAX_DEPRECATED_BUILD_NUMBER);
  }

  // AWS SQS for SMS
  get SNS_SMS_REGION() {
    return process.env.A_SNS_SMS_REGION;
  }

  get SNS_SMS_ACCESS_KEY_ID() {
    return process.env.A_SNS_SMS_ACCESS_KEY_ID;
  }

  get SNS_SMS_SECRET_ACCESS_KEY() {
    return process.env.A_SNS_SMS_SECRET_ACCESS_KEY;
  }

  // These are non production whitelisted phone numbers which will get actual SMS.
  get NON_PRODUCTION_WHITELISTED_PHONE_NUMBERS() {
    const oThis = this;

    if (oThis.environment !== 'production') {
      return JSON.parse(process.env.A_NON_PRODUCTION_WHITELISTED_PHONE_NUMBERS || '[]');
    }

    // In case this is called in production, always return empty array.
    return [];
  }

  // S3 AWS config.
  get AWS_ACCESS_KEY() {
    return process.env.A_S3_AWS_ACCESS_KEY;
  }

  get AWS_SECRET_KEY() {
    return process.env.A_S3_AWS_SECRET_KEY;
  }

  get AWS_REGION() {
    return process.env.A_S3_AWS_REGION;
  }

  get S3_URL_PREFIX() {
    return process.env.A_S3_URL_PREFIX;
  }

  // S3 folder management.
  get S3_USER_ASSETS_BUCKET() {
    return process.env.A_S3_USER_ASSETS_BUCKET;
  }

  get S3_AWS_MASTER_FOLDER() {
    return process.env.A_S3_AWS_MASTER_FOLDER;
  }

  get S3_BUCKET() {
    return process.env.S3_BUCKET;
  }

  get S3_USER_ASSETS_FOLDER() {
    const oThis = this;

    return `${oThis.S3_AWS_MASTER_FOLDER}/ua`;
  }

  get S3_USER_IMAGES_FOLDER() {
    const oThis = this;

    return oThis.S3_USER_ASSETS_FOLDER + oThis.IMAGES_S3_FOLDER;
  }

  get IMAGES_S3_FOLDER() {
    return '/images';
  }

  // CDN Url
  get CDN_URL() {
    return process.env.A_CDN_URL;
  }

  get WEB_ASSET_CDN_URL() {
    return process.env.A_WEB_ASSET_CDN_URL;
  }

  get WHISPER_CHAIN_LENS_PROFILE_ID() {
    return process.env.WHISPER_CHAIN_LENS_PROFILE_ID;
  }

  // Telegram bot token
  get TELEGRAM_BOT_TOKEN() {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  get TELEGRAM_WHITELISTED_USER_IDS() {
    return process.env.WHITELISTED_USER_IDS;
  }

  get FRONTEND_DOMAIN() {
    return process.env.FRONTEND_DOMAIN;
  }
}

module.exports = new CoreConstants();
