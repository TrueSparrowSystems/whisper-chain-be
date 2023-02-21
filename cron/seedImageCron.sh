#!/bin/sh
. /usr/src/app/.env
/usr/local/bin/node /usr/src/app/lib/cron/seedImage.js >> /tmp/seedImage.log

