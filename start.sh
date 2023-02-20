#!/usr/bin/env bash
source .env
node db/seed.js
node db/migrate.js
/usr/bin/supervisord -c /usr/src/app/supervisord.conf