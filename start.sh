#!/usr/bin/env bash
source .env
echo "export A_MAIN_DB_MYSQL_HOST='$A_MAIN_DB_MYSQL_HOST'" >> .env
echo "export A_MAIN_DB_MYSQL_USER='$A_MAIN_DB_MYSQL_USER'" >> .env
echo "export A_MAIN_DB_MYSQL_PASSWORD='$A_MAIN_DB_MYSQL_PASSWORD'" >> .env
echo "export NA_MEMCACHE_SERVERS='$NA_MEMCACHE_SERVERS:11211'" >> .env
echo "export S3_ACCESS_KEY_ID='$S3_ACCESS_KEY_ID'" >> .env
echo "export S3_SECRET_ACCESS_KEY='$S3_SECRET_ACCESS_KEY'" >> .env
node db/seed.js
node db/migrate.js
/usr/bin/supervisord -c /usr/src/app/supervisord.conf