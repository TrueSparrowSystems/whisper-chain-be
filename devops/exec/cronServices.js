const rootPrefix = '../..',
  command = require('commander'),
  InsertCronKlass = require(rootPrefix + '/devops/utils/cronServices/CreateCron'),
  StopCronKlass = require(rootPrefix + '/devops/utils/cronServices/StopCron');

command
  .version('0.1.0')
  .usage('[options]')
  .option('--create', 'Create New CronJob')
  .option('--stop-stuck-cron', 'Stop CronJob')
  .option('--identifiers <required>', 'Ids array to stop cron ')
  .option('--in-file <required>', 'Input JSON to create new cron')
  .option('--out-file <required>', 'Output JSON while create cron')
  .parse(process.argv);

const handleError = function() {
  command.outputHelp();
  throw new Error('Required parameters are missing!');
};

/**
 * Class to Cron services
 *
 * @class
 */
class CreateUpdateCrons {
  async perform() {
    let performerObj = null;

    if (command.opts().create) {
      performerObj = new InsertCronKlass(command.opts().inFile, command.opts().outFile);
    } else if (command.opts().stopStuckCron) {
      const ids = command.opts().identifiers.split(' ');
      if (ids.length < 1) {
        throw new Error('ids cannot be empty.');
      }
      performerObj = new StopCronKlass(ids);
    } else {
      handleError();
    }

    const resp = performerObj ? await performerObj.perform() : handleError();
    if (resp.isFailure()) {
      throw resp;
    }

    return resp;
  }
}

const createUpdateCrons = new CreateUpdateCrons();

createUpdateCrons
  .perform()
  .then(function(data) {
    console.error('\ndevops/exec/cronServices.js::data: ', JSON.stringify(data));
    process.exit(0);
  })
  .catch(function(err) {
    console.error('\ndevops/exec/cronServices.js::error: ', err);
    process.exit(1);
  });
