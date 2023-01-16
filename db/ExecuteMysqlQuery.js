const mysql = require('mysql');

const rootPrefix = '..',
  mysqlConfig = require(rootPrefix + '/config/mysql'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

/**
 * Class to execute Mysql migration & seed query.
 *
 * @class ExecuteMysqlQuery
 */
class ExecuteMysqlQuery {
  /**
   * Constructor to execute Mysql migration & seed query.
   *
   * @param {string} dbName
   * @param {string} sql
   *
   * @constructor
   */
  constructor(dbName, sql) {
    const oThis = this;

    oThis.dbName = dbName;
    oThis.sql = sql;
  }

  /**
   * Get connection params
   *
   * @return {object}
   */
  get connectionParams() {
    const oThis = this;

    let clusters = mysqlConfig['databases'][oThis.dbName];

    return mysqlConfig['clusters'][clusters[0]]['master'];
  }

  /**
   * Execute the query and return the query response. Also, tries to create database if not present.
   *
   * @return {object}
   */
  async perform() {
    const oThis = this;

    const connection = mysql.createConnection(oThis.connectionParams);

    // Create DB if not present
    await new Promise(function(onResolve, onReject) {
      let dbCreationSql =
        'CREATE DATABASE IF NOT EXISTS ' + oThis.dbName + ' DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;';

      connection.query(dbCreationSql, function(err) {
        if (err) {
          onReject(err);
        }

        onResolve();
      });
    });

    // Execute the sql
    await new Promise(function(onResolve, onReject) {
      let useDbQuery = 'USE ' + oThis.dbName;

      connection.query(useDbQuery, function(err) {
        if (err) {
          onReject(err);
        }
        onResolve();
      });
    });

    // Execute the sql
    let queryResult = await new Promise(function(onResolve, onReject) {
      connection.query(oThis.sql, function(err, results, fields) {
        if (err) {
          onReject(err);
        }

        logger.log(oThis.sql);

        onResolve([results, fields]);
      });
    });

    // End the connection
    await new Promise(function(onResolve, onReject) {
      connection.end(function(err) {
        if (err) {
          throw err;
        }

        onResolve();
      });
    });

    return queryResult;
  }
}

module.exports = ExecuteMysqlQuery;
