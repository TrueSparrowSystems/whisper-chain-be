/**
 * This script will seed the cron_processes table.
 *
 * Usage:
 *    1] To add entries for all crons:- node lib/cronProcess/cronSeeder.js
 *    2] To add specific cron:- node lib/cronProcess/cronSeeder.js --kinds 'hookProcessor'
 *
 * Note:
 *    You can also specify cron config file path using '--config-file-path' option
 *
 * @module lib/cronProcess/cronSeeder
 *
 */

const rootPrefix = '../..',
  InsertCrons = require(rootPrefix + '/lib/cronProcess/InsertCrons'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger');

const command = require('commander'),
  path = require('path'),
  appRootPath = path.resolve(__dirname, rootPrefix);

command
  .usage('[options]')
  .option('--config-file-path <required>', 'Config file absolute path')
  .option('--kinds <required>', 'CronKinds Array')
  .parse(process.argv);

class CronSeeder {
  constructor(params) {
    const oThis = this;

    oThis.configFilePath = params.configFilePath;
    oThis.kinds = params.kinds;
  }

  /**
   * Async performer.
   *
   * @returns {Promise<boolean>}
   */
  async perform() {
    const oThis = this;

    // eslint-disable-next-line no-undefined
    if (oThis.configFilePath === undefined) {
      oThis.configFilePath = `${appRootPath}/lib/cronProcess/cronSample.json`;
    }

    return oThis._seed();
  }

  /**
   * Seed cron processes.
   *
   * @returns {Promise<boolean>}
   * @private
   */
  async _seed() {
    const oThis = this;

    const configData = require(oThis.configFilePath),
      allCronKinds = Object.keys(configData);

    const kindsToInsert = oThis.kinds ? basicHelper.commaSeparatedStrToArray(oThis.kinds) : allCronKinds;

    for (let index = 0; index < kindsToInsert.length; index++) {
      const cronParams = configData[kindsToInsert[index]],
        insertCronRsp = await new InsertCrons({
          cronKindName: kindsToInsert[index],
          cronParams: cronParams
        })
          .perform()
          .catch(function() {
            // Do nothing.
          });
      logger.log('insertCronRsp: ', insertCronRsp);
    }

    return true;
  }
}

const cronSeeder = new CronSeeder({ configFilePath: command.configFilePath, kinds: command.kinds });

cronSeeder
  .perform()
  .then(function(data) {
    logger.log('\nSuccess data: ', data);
    process.exit(0);
  })
  .catch(function(err) {
    logger.error('\nError data: ', err);
    process.exit(1);
  });
