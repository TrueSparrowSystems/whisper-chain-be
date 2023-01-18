# node-boilerplate

https://localhost/

## Pre-requisites for setting up environment

* Start [MySQL](https://www.mysql.com/downloads/)
```bash
  mysql.server start
```

* Start [Memcached](https://memcached.org/)
```bash
  memcached -p 11211 -d
```

* Start [RabbitMQ](https://www.rabbitmq.com/download.html)
```bash
  brew services start rabbitmq
```

* Install and start [Cassandra](https://cassandra.apache.org/)
    - Install Cassandra
    ```bash
      brew install cassandra
    ```

    - Open /usr/local/etc/cassandra/cassandra.yaml file. Search for the following string 'authenticator: AllowAllAuthenticator'. Replace 'AllowAllAuthenticator' with 'PasswordAuthenticator'. Start cassandra.
    ```bash
      brew services start cassandra
    ```
  
## Install all the dependency npm packages

```bash
rm -rf node_modules
rm -rf package-lock.json
npm install
```

## Seed DB

* Create the main db and create schema_migrations table.

```bash
source set_env_vars.sh

node db/seed.js

```

* Run selective migrations

```bash
source set_env_vars.sh

# create config_strategies table
node db/migrate.js --up 1649845879511

# create error_logs table
node db/migrate.js --up 1650540544076  
```

## Seed config strategy

* Global Configs Seed

```bash
source set_env_vars.sh
node devops/exec/configStrategy.js 

# For particular config strategy 
node devops/exec/configStrategy.js --kinds 'memcached,bgJobRabbitmq'

Note: To update config strategy change 'last_modified_at' in respective strategy in config file to current timestamp. 

* Activate Global Configs

```bash
source set_env_vars.sh
node devops/exec/configStrategy.js --activate-configs
```

## Run DB Migrations

* Run all pending migrations.

```bash
node db/migrate.js
```


## Start cron processes

* Seed the cron processes using this script.
```bash
source set_env_vars.sh
node lib/cronProcess/cronSeeder.js
```

* Factory process for processing background jobs
```bash
# note: for topics to subscribe and prefetch count, please see params column of the cron_processes table
source set_env_vars.sh
node executables/rabbitMqSubscribers/bgJobProcessor.js --cronProcessId 3
```

* Cron for monitoring the cron processes table
```bash
source set_env_vars.sh
node executables/cronProcessesMonitor.js --cronProcessId 27
```

## Helper commands

* Clear cache.
```bash
  node devops/exec/flushMemcache.js
```

* Generate API documentation
```bash
  npm run generate-openapi-docs
```

## Web-sockets
* Start web-socket server.
```bash
  source set_env_vars.sh
  node websocket-server.js
```
## Daily post publication cron db seeding steps
1. Take images from PX team, upload them inside the *stability* folder in the *whisperchain-staging-static-files* bucket and make them public.
2. Create a new entry in the *images* table where *url* is S3 url from step 1 and *ipfs_object_id* field will be empty.
3. Create a new entry in the *platform_chain_seeds* table where *image_id* field will be id of the images table from step 2 and *is_published* field will be 2. 
