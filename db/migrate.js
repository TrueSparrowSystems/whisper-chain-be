const fs = require('fs'),
  program = require('commander');

program
  .option('--up <up>', 'Specify a specific migration version to perform.')
  .option('--down <down>', 'Specify a specific migration version to revert.')
  .option('--redo <redo>', 'Specify a specific migration version to redo.')
  .option('--redoAll', 'Rerun all the migrations')
  .option('--generate <name>', 'Specify migration name to generate with bare minimum content.')
  .parse(process.argv);

const rootPrefix = '..',
  ExecuteMysqlQuery = require(rootPrefix + '/db/ExecuteMysqlQuery'),
  database = require(rootPrefix + '/lib/globalConstant/database'),
  dbKindConstants = require(rootPrefix + '/lib/globalConstant/dbKind'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

const migrationFolder = __dirname + '/migration',
  mainDbName = database.mainDbName;

/**
 * Class to manage migrations.
 *
 * @class DbMigrate
 */
class DbMigrate {
  /**
   * Constructor to manage migrations.
   *
   * @constructor
   */
  constructor() {
    const oThis = this;

    oThis.upVersion = program.opts().up;
    oThis.downVersion = program.opts().down;
    oThis.redoVersion = program.opts().redo;
    oThis.redoAllVersion = program.opts().redoAll;

    oThis.allVersionMap = {};
    oThis.existingVersionMap = {};
    oThis.missingVersions = [];
  }

  /**
   * Main performer for class.
   *
   */
  async perform() {
    const oThis = this;

    oThis
      ._asyncPerform()
      .then(function() {
        logger.win('Done!');
        process.exit(0);
      })
      .catch(function(err) {
        logger.error(err);
        process.exit(1);
      });
  }

  /**
   * Async perform.
   *
   * @return {Promise<void>}
   * @private
   */
  async _asyncPerform() {
    const oThis = this;

    oThis._fetchAllVersions();

    await oThis._fetchExistingVersions();

    if (oThis.upVersion) {
      if (oThis.existingVersionMap[oThis.upVersion]) {
        throw new Error(
          'Migration version ' + oThis.upVersion + ' is already up. If you want to re-run it, use redo flag.'
        );
      }
      await oThis._runMigration(oThis.upVersion);
    } else if (oThis.downVersion) {
      if (!oThis.existingVersionMap[oThis.downVersion]) {
        throw new Error('Migration version ' + oThis.downVersion + ' is NOT up. Reverting it is not allowed.');
      }
      await oThis._revertMigration(oThis.downVersion);
    } else if (oThis.redoVersion) {
      if (!oThis.existingVersionMap[oThis.redoVersion]) {
        throw new Error('Migration version ' + oThis.redoVersion + ' is NOT up. Re-doing it is not allowed.');
      }
      await oThis._revertMigration(oThis.redoVersion);
      await oThis._runMigration(oThis.redoVersion);
    } else if (oThis.redoAllVersion) {
      const existingVersionArr = Object.keys(oThis.existingVersionMap);
      existingVersionArr.sort();

      if (existingVersionArr.length === 0) {
        return null;
      }

      // Looping over the existing versions to run the down migrations in reverse order.
      for (let index = existingVersionArr.length - 1; index > -1; index--) {
        const currentVersion = existingVersionArr[index];
        await oThis._revertMigration(currentVersion);
      }

      // Looping over all migrations.
      for (let index = 0; index < existingVersionArr.length; index++) {
        const currentVersion = existingVersionArr[index];
        await oThis._runMigration(currentVersion);
      }
    } else {
      oThis._findMissingVersions();

      // Looping over the missing versions to run the migrations.
      for (let index = 0; index < oThis.missingVersions.length; index++) {
        const version = oThis.missingVersions[index];

        await oThis._runMigration(version);
      }
    }
  }

  /**
   * Run migration.
   *
   * @param {string} version
   *
   * @return {Promise<void>}
   * @private
   */
  async _runMigration(version) {
    const oThis = this;

    const migrationFile = oThis.allVersionMap[version];

    logger.log('-----------------------------------------');
    logger.step('Executing migration version(', version, ')');

    const versionInfo = require(migrationFolder + '/' + migrationFile);

    for (let index = 0; index < versionInfo.up.length; index++) {
      const query = versionInfo.up[index];

      await oThis._executeQuery(versionInfo, query);
    }

    const insertVersionSql = "INSERT INTO `schema_migrations` (`version`) VALUES('" + version + "')";

    await new ExecuteMysqlQuery(mainDbName, insertVersionSql).perform();

    logger.win('Executed migration version(', version, ')');
    logger.log('-----------------------------------------');
  }

  /**
   * Revert migration
   *
   * @param {string} version
   *
   * @return {Promise<void>}
   * @private
   */
  async _revertMigration(version) {
    const oThis = this;

    const migrationFile = oThis.allVersionMap[version];

    logger.log('-----------------------------------------');
    logger.step('Reverting migration version(', version, ')');

    const versionInfo = require(migrationFolder + '/' + migrationFile);

    for (let index = 0; index < versionInfo.down.length; index++) {
      const query = versionInfo.down[index];

      await oThis._executeQuery(versionInfo, query);
    }

    const insertVersionSql = "DELETE FROM `schema_migrations` WHERE `version`='" + version + "'";

    await new ExecuteMysqlQuery(mainDbName, insertVersionSql).perform();

    logger.win('Reverted migration version(', version, ')');
    logger.log('-----------------------------------------');
  }

  /**
   * Fetch all versions
   *
   * @sets oThis.allVersionMap
   *
   * @return {Promise<void>}
   * @private
   */
  _fetchAllVersions() {
    const oThis = this;

    const fileNames = fs.readdirSync(migrationFolder);

    for (let index = 0; index < fileNames.length; index++) {
      const currFile = fileNames[index];
      const currVersion = currFile.split('_')[0];

      if (currVersion) {
        oThis.allVersionMap[currVersion] = currFile;
      }
    }
  }

  /**
   * Fetch existing versions
   *
   * @sets oThis.existingVersionMap
   *
   * @return {Promise<void>}
   * @private
   */
  async _fetchExistingVersions() {
    const oThis = this;

    const schemaMigrationQuery = 'SELECT * FROM schema_migrations;';

    const versionQueryResult = await new ExecuteMysqlQuery(mainDbName, schemaMigrationQuery).perform();

    const rows = (versionQueryResult || [])[0] || [];

    for (let index = 0; index < rows.length; index++) {
      const currRow = rows[index];

      oThis.existingVersionMap[currRow.version] = 1;
    }
  }

  /**
   * Find missing versions and sort them
   *
   * @sets oThis.missingVersions
   *
   * @return {Promise<void>}
   * @private
   */
  _findMissingVersions() {
    const oThis = this;

    for (const version in oThis.allVersionMap) {
      if (!oThis.existingVersionMap[version]) {
        oThis.missingVersions.push(parseInt(version));
      }
    }

    oThis.missingVersions.sort();
  }

  /**
   * Execute query
   *
   * @param {object} versionInfo
   * @param {string} query
   *
   * @returns {Promise<void>}
   * @private
   */
  async _executeQuery(versionInfo, query) {
    let dbName = versionInfo.dbName;
    let dbKind = versionInfo.dbKind;
    let keySpace = versionInfo.keySpace;
    let tables = versionInfo.tables;

    console.log(dbKind, tables);

    if (tables.length == 0) {
      throw new Error('Please specify tables for migrations');
    }

    if (dbKind == dbKindConstants.sqlDbKind) {
      return new ExecuteMysqlQuery(dbName, query).perform();
    } else throw new Error(`Invalid dbKind-${dbKind}`);
  }
}

if (program.opts().generate) {
  const fileName = migrationFolder + '/' + Date.now() + '_' + program.opts().generate + '.js';
  const fileDummyData =
    'const migrationName = {\n' +
    "  dbName: 'db name here',\n" +
    "  up: ['array of sql queries here'],\n" +
    "  down: ['array of sql queries here'],\n" +
    "  dbKind: 'db kind here',\n" +
    '  tables: [],\n' +
    "  keySpace: 'keySpace here'\n" +
    '};\n' +
    '\n' +
    'module.exports = migrationName;';

  fs.appendFile(fileName, fileDummyData, function(err) {
    if (err) {
      logger.error(err);
    }

    logger.log('The file ' + fileName + ' is created!');
  });
} else {
  new DbMigrate().perform();
}
