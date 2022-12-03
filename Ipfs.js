const fs = require('fs');
const { uuid } = require('uuidv4');

class Ipfs {
  async uploadImage(fileName, localFileData) {
    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        "X-NAME": fileName,
        Authorization: `Bearer ${process.env.IPFS_TOKEN}`,
      },
      body: localFileData,
    });
    const responseJson = await response?.json();

    const cid = responseJson?.cid;

    return cid
  }

  async uploadMetaData(imageFileName, cid) {
    const oThis = this;

    const client = await oThis._ipfsClient();
    const imageLink = `ipfs://${cid}`;
    const postData = {
      version: "2.0.0",
      mainContentFocus: "IMAGE",
      metadata_id: uuid(),
      description: "Description",
      locale: "en-US",
      content: "Image",
      image: imageLink,
      imageMimeType: 'image/png',
      name: imageFileName,
      attributes: [],
      media: [
        {
          item: imageLink,
          type: 'image/png',
        },
      ],
      tags: ["whisper.lens"],
      appId: "react_lens",
    };

    let result;

    try {
      result = await client.add(JSON.stringify(postData));
    } catch(err) {
      console.log('error', err)
    }

    return result.path;
  }

  async _ipfsClient() {
    const { create } = await import('ipfs-http-client');

    const auth = `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_API_SECRET_KEY}`;

    const client = await create(
      {
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          "Authorization": `Basic ${Buffer.from(auth).toString("base64")}`
        }
      });

    return client;
  }
}

module.exports = Ipfs;
