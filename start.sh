#!/usr/bin/env bash
source .env
node db/seed.js
node db/migrate.js
nohup /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &
npm start