const fs = require('fs');
const { uuid } = require('uuidv4');

class Ipfs {
  async uploadImage(fileName, localFileData) {
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'X-NAME': fileName,
        Authorization: `Bearer ${process.env.IPFS_TOKEN}`
      },
      body: localFileData
    });
    const responseJson = await response?.json();

    const cid = responseJson?.cid;

    return cid;
  }

  async uploadMetaData(imageFileName, cid) {
    const oThis = this;

    const client = await oThis._ipfsClient();
    const imageLink = `ipfs://${cid}`;
    const postData = {
      version: '2.0.0',
      mainContentFocus: 'IMAGE',
      metadata_id: uuid(),
      description: 'Created By WhisperChain',
      locale: 'en-US',
      content: '',
      image: imageLink,
      imageMimeType: 'image/png',
      name: imageFileName,
      attributes: [],
      media: [
        {
          item: imageLink,
          type: 'image/png'
        }
      ],
      tags: ['whisper.lens'],
      appId: 'whisper_chain'
    };

    let result;

    try {
      result = await client.add(JSON.stringify(postData));
    } catch (err) {
      console.log('error', err);
    }

    return result.path;
  }

  async uploadSeedWhisperMetaData(cid) {
    const oThis = this;

    const client = await oThis._ipfsClient();
    const imageLink = `ipfs://${cid}`;
    let result = null;

    const whisperOfTheDay = `Whisperchain for today starts here!

    - 🪄Start now by submitting your own generations on http://whisperchain.xyz
    
    - ❤️ Collect the best whispers, 
    
    - 💪 All proceeds from the collects will be sent to the respective participants! 
    
    - 🙌 All collects on this thread will be equally distributed between all participants. (know more)
    
    New to WhisperChain? Know more about us: https://www.notion.so/plgworks/Whisper-Chain-fc95cbdc8f9a4a41b87747a190477a61`;
    const postData = {
      version: '2.0.0',
      mainContentFocus: 'IMAGE',
      metadata_id: uuid(),
      description: 'Created By WhisperChain',
      locale: 'en-US',
      content: whisperOfTheDay,
      image: imageLink,
      imageMimeType: 'image/png',
      name: 'Post by whisper chain',
      attributes: [],
      media: [
        {
          item: imageLink,
          type: 'image/png'
        }
      ],
      tags: [],
      appId: 'whisper_chain'
    };
    try {
      result = await client.add(JSON.stringify(postData));
    } catch (err) {
      console.log('error', err);
    }
    return result.path;
  }
  async _ipfsClient() {
    const { create } = await import('ipfs-http-client');
    const auth = `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_API_SECRET_KEY}`;
    const client = await create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        Authorization: `Basic ${Buffer.from(auth).toString('base64')}`
      }
    });
    return client;
  }
  async _uploadMetadataToIpfsNftport() {
    const sdk = require('api')('@nftport/v0#1llv231shlb6micbd');
    const imageLink = `ipfs://bafkreiexxfrveuxwlvqtmytwoywczbnxihbi4lmbelifbkwc7tx4djyj7m`;
    sdk.auth('95b7af04-7238-4662-b6cf-168837dcc006');
    sdk
      .uploadMetadataToIpfs({
        name: 'image',
        description: 'Created By WhisperChain',
        file_url: 'https://ipfs.io/ipfs/bafkreiexxfrveuxwlvqtmytwoywczbnxihbi4lmbelifbkwc7tx4djyj7m',
        custom_fields: {
          version: '2.0.0',
          mainContentFocus: 'IMAGE',
          metadata_id: uuid(),
          locale: 'en-US',
          content: '',
          image: imageLink,
          imageMimeType: 'image/png',
          attributes: [],
          media: [
            {
              item: imageLink,
              type: 'image/png'
            }
          ],
          tags: ['whisper.lens'],
          appId: 'whisper_chain'
        }
      })
      .then(({ data }) => console.log(data))
      .catch((err) => console.error(err));
  }
}
module.exports = Ipfs;
