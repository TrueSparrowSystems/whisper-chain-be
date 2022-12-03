const CollectsAndRepliers = require('./CollectsAndRepliers');
const ApproveAndDisperse = require('./ApproveAndDisperse');

async function perform() {
  const fetchResponse = await new CollectsAndRepliers().fetch();

  if(!fetchResponse.walletAddresses.length || !fetchResponse.totalCollects) {
    console.log('no disperse needed.');
    return;
  }

  await new ApproveAndDisperse(fetchResponse.walletAddresses, fetchResponse.totalCollects).perform()
}

perform();
