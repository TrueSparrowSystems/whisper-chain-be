const PushAPI = require('@pushprotocol/restapi');
const ethers = require('ethers');

class SendNotification {
  constructor() {}

  async perform(recipientAddress) {
    const Pkey = `0x${process.env.TX_SIGNER}`;
    const signer = new ethers.Wallet(Pkey);

    console.log('* Sending push notification to:', recipientAddress);

    await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // subset
      identityType: 2, // direct payload
      notification: {
        title: `Whisper Chain`,
        body: `We have credited your share from the proceeds from collect.`
      },
      payload: {
        title: `Whisper Chain`,
        body: `We have credited your share from the proceeds from collect.`,
        cta: '',
        img: ''
      },
      recipients: `eip155:5:${recipientAddress}`, // recipients addresses
      channel: 'eip155:5:0x90314a78c2EEDB00a46Fd79B738270c5de9a7883', // your channel address
      env: 'staging'
    });

    console.log('** Push notification sent to:', recipientAddress);
  }
}
module.exports = SendNotification;
