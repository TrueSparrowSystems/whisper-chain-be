#!/usr/bin/env bash
# Core ENV Details.
export A_ENVIRONMENT='development'
export A_PORT=3000
export A_DEFAULT_LOG_LEVEL='debug';
export API_DOMAIN='http://localhost/'
export A_COOKIE_DOMAIN='.localhost'

# cookie signing secret for web cookie
export A_W_COOKIE_SECRET='CDD4AB199C16987854027C10EA1C3FD2D37BABC9B298E3E6F9A554068BCA53CA'

# cookie signing secret for mobile cookie
export A_V1_COOKIE_SECRET='aa5298d3a3fe181a3a52d085ee1525df5asa498337f8f3b76ca7df0a5de3211b'

export A_COOKIE_TOKEN_SECRET='aa5298d3a3fe181a3a52d085ee1125df5asa498337f8f3b76ca7df0a5de3211b'

# Devops error logs framework.
export A_DEVOPS_APP_NAME='boilerplate-api';
export A_DEVOPS_ENV_ID='dev1-sandbox';
export A_DEVOPS_IP_ADDRESS='127.0.0.1';

# Devops websocket server identifier.
export A_DEVOPS_SERVER_IDENTIFIER='123456';

# Database details.
export A_MYSQL_CONNECTION_POOL_SIZE='3'

export A_DB_SUFFIX='development'

# Mysql main db.
export A_MAIN_DB_MYSQL_HOST='127.0.0.1'
export A_MAIN_DB_MYSQL_USER='root'
export A_MAIN_DB_MYSQL_PASSWORD='root'

export A_MAIN_DB_MYSQL_HOST_SLAVE='127.0.0.1'
export A_MAIN_DB_MYSQL_USER_SLAVE='root'
export A_MAIN_DB_MYSQL_PASSWORD_SLAVE='root'

# mysql config db
export A_CONFIG_DB_MYSQL_HOST='127.0.0.1'
export A_CONFIG_DB_MYSQL_USER='root'
export A_CONFIG_DB_MYSQL_PASSWORD='root'

# mysql big db
export A_BIG_DB_MYSQL_HOST='127.0.0.1'
export A_BIG_DB_MYSQL_USER='root'
export A_BIG_DB_MYSQL_PASSWORD='root'

# mysql entity db
export A_ENTITY_DB_MYSQL_HOST='127.0.0.1'
export A_ENTITY_DB_MYSQL_USER='root'
export A_ENTITY_DB_MYSQL_PASSWORD='root'

# mysql user db
export A_USER_DB_MYSQL_HOST='127.0.0.1'
export A_USER_DB_MYSQL_USER='root'
export A_USER_DB_MYSQL_PASSWORD='root'

#mysql socket db
export A_SOCKET_DB_MYSQL_HOST='127.0.0.1'
export A_SOCKET_DB_MYSQL_USER='root'
export A_SOCKET_DB_MYSQL_PASSWORD='root'

# Cassandra related variables.
export A_DEFAULT_REPLICATION_LEVEL='localOne'
export A_CASSANDRA_REPLICATION_CLASS='SimpleStrategy'
export A_CASSANDRA_REPLICATION_FACTOR='3'

# App support variables
export API_MIN_SUPPORTED_BUILD_NUMBER='{"ios": "0", "android": "0"}';
export API_MAX_DEPRECATED_BUILD_NUMBER='{"ios": "130", "android": "130"}';

# AWS PINPOINT details
export A_AWS_PINPOINT_REGION='us-east-1';

# S3 config details
export A_S3_AWS_ACCESS_KEY=''
export A_S3_AWS_SECRET_KEY=''
export A_S3_AWS_REGION='us-east-1'
export A_S3_URL_PREFIX=''
export A_S3_AWS_MASTER_FOLDER='d'
export A_S3_USER_ASSETS_BUCKET='userassets-xyz'

# CDN details.
export A_CDN_URL=''
export A_WEB_ASSET_CDN_URL=''

# Pepo Campaigns Details
export A_CAMPAIGN_CLIENT_KEY="8341ba516cfd2305de7d21ca128eca19"
export A_CAMPAIGN_CLIENT_SECRET="6ef999e88204c01eabbf8c4289854073"
export A_CAMPAIGN_BASE_URL="https://pepocampaigns.com"
export A_CAMPAIGN_MASTER_LIST="209430"

# New Env vars
export A_CONFIG_STRATEGY_SALT='TGBhn76sdf54dfv67ghn7GBJQ1c5RScvbnFGOKUvCr2vNFiAEsU41wBpyFWLKJHGV'
export A_ENCRYPTION_KEY='88338e0b737e2374c2f4588e590e8fd0'

# AWS SNS for SMS sending
export A_SNS_SMS_REGION=''; #us-east-1
export A_SNS_SMS_ACCESS_KEY_ID='';
export A_SNS_SMS_SECRET_ACCESS_KEY='';
export A_NON_PRODUCTION_WHITELISTED_PHONE_NUMBERS='[""]';
# TODO: add SNS env vars.

