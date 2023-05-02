# Whisper Chain Backend
Node.js repository for Whisper Chain REST APIs and cron processes.

## Documentation
### OpenAPI Specs
We've used OpenAPI specifications to standardize our API documentation, and we've written a generator script to make it easy to create the documentation.
To generate the docs, simply run this command:
```sh
 > npm run generate-openapi-docs
```

To view the specs in a user-friendly UI, simply visit `<domain>/api-docs` in your browser.

### DB Schema Doc
We've used DBML to document the MySQL tables in our project. You can find the DB schema documentation in the `docs/dbSchema.dbml` file.

To view the schema diagram in a user-friendly graphical format, you can use the following [online editor](https://dbdiagram.io/d).

### Sequence Diagrams
To provide an easy-to-understand overview of the different steps involved in various flows, we've created a number of sequence diagrams.
You can find these diagrams in the `docs/sequenceDiagrams` folder.

## Environment Setup

### Prerequisites
Before you can start the server, please make sure that you have the following prerequisites installed:
- [Node.js](https://nodejs.org/en/download/) - the latest LTS version is recommended.
- [MySQL](https://www.mysql.com/downloads/)

You will also need to set the correct values for the environment variables mentioned in the `./env_vars.sample` file.

### Starting the Server
To start the server, please follow the steps below:

- Install the required NPM dependencies by running the following commands:
```shell script
rm -rf node_modules
rm -rf package-lock.json
npm install
```

- Create the main db and create schema_migrations table using the following command:
```shell script
source set_env_vars.sh
node db/seed.js
  ```

- Run all pending migrations by running the following commands:
```shell script
source set_env_vars.sh
node db/migrate.js

```

- Start the server by running the following commands:
```shell script
source set_env_vars.sh
npm start
```

### Start Cron Processes
TODO

## Seeding Chain Images
We have created a telegram bot to maintain a reserve of images for future lens profile posts.
This ensures that we always have a set of images ready to go.
These images will be posted one by one each day to lens through a cron job.

### Telegram Bot Setup
1. Create a bot on the Telegram platform.
2. Set the following environment variables:
   - TELEGRAM_BOT_TOKEN - Bot token
   - WHITELISTED_USER_IDS - An array of telegram user IDs of admin users.
3. Set up a continuous cron job using the following command:
```shell script
node lib/cron/seedImage.js
```

### Using the Telegram Bot
To use the telegram bot, please follow the steps below:
1. Go to the bot page on Telegram.
2. Upload the photo that you would like to add to the reserve.

That's it! The image will be added to the reserve and will be available for future posts.
