#!/usr/bin/env bash
source .env
node db/seed.js
node db/migrate.js
npm start