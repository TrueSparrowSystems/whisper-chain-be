# Whisper Chain Backend
This repository has implementation of Whisper Chain backend APIs and cron processes, developed using Node.js.

## Pre-requisites for environment setup

* Install [Node.js](https://nodejs.org/en/download/) - currently the latest LTS version is 18 and we encourage installing the same.

* Set proper values of env vars mentioned in ./env_vars.sample file

* Install and start [MySQL](https://www.mysql.com/downloads/). Create the user with the credentials mentioned in env vars, so that code can interact with the DB.
```sh
 > mysql.server start
```

* Create the main db and create schema_migrations table using the following command.
```sh
 > source set_env_vars.sh

 > node db/seed.js
```

## Start Server
* Install required NPM dependencies
```sh
 > rm -rf node_modules
 > rm -rf package-lock.json
 > npm install
```

* Running all pending migrations.
```sh
 > source set_env_vars.sh
 > node db/migrate.js
```

* Start the server
```sh
 > npm start
```
## Start Cron Processes
TODO

## Documentation

* Generate OpenAPI Specs
```sh
 > npm run generate-openapi-docs
```

* Detailed documentation can be found at <domain>/api-docs route.

## Daily post publication cron db seeding steps using telegram bot
1. Download and open Telegram.
2. Search for 
    - Local WhisperChain (@localWCBot) for testing
    - Whisper Chain Admin (@WhisperChainAdminBot) for deployment
3. Run node lib/cron/seedImage.js and send image on the bot and select "Compress the image". 
