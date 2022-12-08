/*
 * Manage mysql clusters and connection pools
 */
const rootPrefix = '..',
  mysql = require('mysql'),
  mysqlConfig = require(rootPrefix + '/config/mysql'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  poolClusters = {};

/**
 * Class to generate mysql pool clusters
 *
 * @class generatePoolClusters
 */
class generatePoolClusters {
  /**
   * Creating pool cluster object in poolClusters map
   *
   * @param {string} cName
   * @param {string} dbName
   * @param {object} cConfig
   * @param {string} identifier
   */
  static generateCluster(cName, dbName, cConfig, identifier) {
    let clusterName = cName + '.' + dbName;

    if (identifier) {
      clusterName = clusterName + '.' + identifier;
    }

    // Initializing the pool cluster obj using the commonClusterConfig
    poolClusters[clusterName] = mysql.createPoolCluster(mysqlConfig['commonClusterConfig']);

    // Looping over each node and adding it to the pool cluster obj
    for (const nName in cConfig) {
      const finalConfig = Object.assign({}, cConfig[nName], mysqlConfig['commonNodeConfig'], { database: dbName });
      poolClusters[clusterName].add(nName, finalConfig);
    }

    // When a node dis-functions, it is removed from the pool cluster obj and following CB is called
    poolClusters[clusterName].on('remove', function(nodeId) {
      // We are using logger.notify here so that we don't face the circular dependency for creating entry in error_logs table.
      logger.error('m_w_1', 'REMOVED NODE : ' + nodeId + ' in ' + clusterName);
      logger.notify('m_w_1', `REMOVED NODE: ${nodeId} in ${clusterName}`);
    });
  }

  /**
   * This loops over all the databases and creates pool cluster objects map in poolClusters
   */
  static init() {
    const oThis = this;
    // Looping over all databases
    for (const dbName in mysqlConfig['databases']) {
      const dbClusters = mysqlConfig['databases'][dbName];
      // Looping over all clusters for the database
      for (let index = 0; index < dbClusters.length; index++) {
        const cName = dbClusters[index],
          cConfig = mysqlConfig['clusters'][cName];

        // Creating pool cluster object in poolClusters map
        oThis.generateCluster(cName, dbName, cConfig);
      }
    }
  }
}

generatePoolClusters.init();

/**
 * Helper methods for mysql pool clusters
 *
 * @class mysqlWrapper
 */
class mysqlWrapper {
  /**
   * Get mysql pool
   *
   * @param {string} dbName
   * @param {string} nodeType
   * @param {string} clusterName
   *
   * @returns {Buffer | Namespace | * | Uint32Array | Int16Array | Int8Array | BigUint64Array | string[] | Int32Array | Uint8ClampedArray | Uint8Array | Float64Array | Float32Array | Uint16Array | BigInt64Array}
   */
  static getPoolFor(dbName, nodeType, clusterName) {
    if (!clusterName) {
      const clusterNames = mysqlConfig['databases'][dbName];
      if (clusterNames.length > 1) {
        throw new Error('Multiple clusters are defined for this DB. Specify cluster name.');
      }
      clusterName = clusterNames[0];
    }
    const dbClusterName = clusterName + '.' + dbName,
      sanitizedNType = nodeType == 'slave' ? 'slave*' : 'master';

    return poolClusters[dbClusterName].of(sanitizedNType);
  }

  /**
   * Get pool clusters
   *
   * @param {string} dbName
   *
   * @returns {Array}
   */
  static getPoolClustersFor(dbName) {
    const clusterPools = [],
      clusterNames = mysqlConfig['databases'][dbName];
    for (let index = 0; index < clusterNames.length; index++) {
      clusterPools.push(mysqlWrapper.getPoolFor(dbName, clusterNames[index], 'master'));
    }

    return clusterPools;
  }

  /**
   * Get pool for dynamic host
   *
   * @param {string} dbName
   * @param {string} nodeType
   * @param {string} clusterName
   * @param {object} config
   *
   * @returns {Buffer | Namespace | * | Uint32Array | Int16Array | Int8Array | BigUint64Array | string[] | Int32Array | Uint8ClampedArray | Uint8Array | Float64Array | Float32Array | Uint16Array | BigInt64Array}
   */
  static getPoolForDynamicHost(dbName, nodeType, clusterName, config) {
    if (!clusterName) {
      const clusterNames = mysqlConfig['databases'][dbName];
      if (clusterNames.length > 1) {
        throw new Error('Multiple clusters are defined for this DB. Specify cluster name.');
      }
      clusterName = clusterNames[0];
    }

    const identifier = config.host,
      dbClusterName = clusterName + '.' + dbName + '.' + identifier,
      sanitizedNType = nodeType == 'slave' ? 'slave*' : 'master';

    if (poolClusters[dbClusterName]) {
      return poolClusters[dbClusterName].of(sanitizedNType);
    } else {
      const cConfig = { ...mysqlConfig['clusters'][clusterName] };
      for (const nName in cConfig) {
        cConfig[nName].host = config.host;
      }

      generatePoolClusters.generateCluster(clusterName, dbName, cConfig, identifier);

      return poolClusters[dbClusterName].of(sanitizedNType);
    }
  }
}

module.exports = mysqlWrapper;
