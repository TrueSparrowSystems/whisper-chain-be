const rootPrefix = '..',
  coreConstants = require(rootPrefix + '/config/coreConstants'),
  database = require(rootPrefix + '/lib/globalConstant/database');

const mysqlConfig = {
  commonNodeConfig: {
    connectionLimit: coreConstants.MYSQL_CONNECTION_POOL_SIZE,
    charset: 'utf8mb4',
    bigNumberStrings: true,
    supportBigNumbers: true,
    dateStrings: true,
    debug: false
  },
  commonClusterConfig: {
    canRetry: true,
    removeNodeErrorCount: 5,
    restoreNodeTimeout: 10000,
    defaultSelector: 'RR'
  },
  clusters: {
    mainDbCluster: {
      master: {
        host: coreConstants.MAIN_DB_MYSQL_HOST,
        user: coreConstants.MAIN_DB_MYSQL_USER,
        password: coreConstants.MAIN_DB_MYSQL_PASSWORD
      },
      slave: {
        host: coreConstants.MAIN_DB_MYSQL_HOST_SLAVE,
        user: coreConstants.MAIN_DB_MYSQL_USER_SLAVE,
        password: coreConstants.MAIN_DB_MYSQL_PASSWORD_SLAVE
      }
    },
    bigDbCluster: {
      master: {
        host: coreConstants.BIG_DB_MYSQL_HOST,
        user: coreConstants.BIG_DB_MYSQL_USER,
        password: coreConstants.BIG_DB_MYSQL_PASSWORD
      }
    },
    configDbCluster: {
      master: {
        host: coreConstants.CONFIG_DB_MYSQL_HOST,
        user: coreConstants.CONFIG_DB_MYSQL_USER,
        password: coreConstants.CONFIG_DB_MYSQL_PASSWORD
      }
    },
    entityDbCluster: {
      master: {
        host: coreConstants.ENTITY_DB_MYSQL_HOST,
        user: coreConstants.ENTITY_DB_MYSQL_USER,
        password: coreConstants.ENTITY_DB_MYSQL_PASSWORD
      }
    },
    userDbCluster: {
      master: {
        host: coreConstants.USER_DB_MYSQL_HOST,
        user: coreConstants.USER_DB_MYSQL_USER,
        password: coreConstants.USER_DB_MYSQL_PASSWORD
      }
    },
    socketDbCluster: {
      master: {
        host: coreConstants.SOCKET_DB_MYSQL_HOST,
        user: coreConstants.SOCKET_DB_MYSQL_USER,
        password: coreConstants.SOCKET_DB_MYSQL_PASSWORD
      }
    }
  },
  databases: {}
};

mysqlConfig.databases[database.mainDbName] = ['mainDbCluster'];

mysqlConfig.databases[database.bigDbName] = ['bigDbCluster'];

mysqlConfig.databases[database.configDbName] = ['configDbCluster'];

mysqlConfig.databases[database.entityDbName] = ['entityDbCluster'];

mysqlConfig.databases[database.userDbName] = ['userDbCluster'];

mysqlConfig.databases[database.socketDbName] = ['socketDbCluster'];

module.exports = mysqlConfig;
