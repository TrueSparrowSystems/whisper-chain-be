# Whisper Chain Backend
Node.js repository for Whisper Chain REST APIs and cron processes.

## Documentation
### OpenAPI Specs
Use the following command to re-generate the API specs.
```sh
 > npm run generate-openapi-docs
```

To see the specs in UI, visit <domain>/api-docs in browser.

### DB Schema Doc
See `docs/dbSchema.dbml` for a dbml doc for the DB schema. Use this [editor](https://dbdiagram.io/d) for viewing it graphically.

### Sequence Diagrams
See `docs/sequenceDiagrams` folder for various sequence diagrams to give an easy understanding of what are the different steps involved in various flows.

## Environment Setup

### Prerequisites
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

### Start Server
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
### Start Cron Processes
TODO

## Seeding Chain Images
We have created a telegram bot to maintain a reserve of images for future postings.
These images will be posted daily to lens through a cron job. This ensures that we always have a set of images ready to go.

### Telegram Bot Setup
1. Create Bot on Telegram side.
2. Set following env variables:
   - TELEGRAM_BOT_TOKEN - Bot token
   - WHITELISTED_USER_IDS - Array of telegram user ids of admin users.
3. Setup continuous cron using following command:
```sh
> node lib/cron/seedImage.js
```

### Telegram Bot Usage
1. Go to bot page.
2. Upload photo. That's it.
