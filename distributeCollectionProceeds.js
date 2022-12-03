const CollectsAndRepliers = require('./CollectsAndRepliers');
const ApproveAndDisperse = require('./ApproveAndDisperse');
const SendNotification = require('./SendNotification');

async function perform() {
  const fetchResponse = await new CollectsAndRepliers().fetch();

  if(!fetchResponse.walletAddresses.length || !fetchResponse.totalCollects) {
    console.log('no disperse needed.');
    return;
  }

  const walletAddresses = fetchResponse.walletAddresses;

  await new ApproveAndDisperse(fetchResponse.walletAddresses, fetchResponse.totalCollects).perform();

  for(const walletAddress of walletAddresses) {
    await new SendNotification().perform(walletAddress);
  }
}

perform();
