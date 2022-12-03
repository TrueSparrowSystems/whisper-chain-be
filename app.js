const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

const FileIo = require('./FileIo');
const Ipfs = require('./Ipfs');

var cors = require('cors');

app.use(cors());

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', async function (req, res) {
  res.send(new Date());
});

app.get('/whisper/suggestions', urlencodedParser, async function (req, res) {
  try {
    const GenerateAndUploadImages = require('./GenerateAndUploadImages');
    const s3Urls = await new GenerateAndUploadImages({prompt: req.query.prompt, artStyle: req.query.art_style || null}).perform();

    res.json({success: true, data: {s3_urls: s3Urls}});
  } catch(error) {
    res.json({success: false});
  }
});

app.get('/whisper', urlencodedParser, async function (req, res) {
  try {
    const s3Url = req.query.s3_url;
    const downloadFilePath = await new FileIo().download(s3Url, 'png');

    console.log('* Downloading file from S3');
    const fileName = downloadFilePath.split('/').at(-1);
    const localFileData = fs.readFileSync(downloadFilePath);
    console.log('** Download file completed from S3');

    console.log('* Upload image to IPFS');
    const imageCid = await new Ipfs().uploadImage(fileName, localFileData);
    console.log('** Upload image to IPFS completed:', imageCid);

    console.log('* Upload meta data to IPFS');
    const metadataCid = await new Ipfs().uploadMetaData(fileName, imageCid);
    console.log('** Upload meta data to IPFS completed:', metadataCid);

    console.log('* Deleting local file');
    fs.rm(downloadFilePath, { recursive: true }, err => {
      if (err) {
        throw err
      }
    });
    console.log('** Deleting local file completed');

    res.json({success: true, data: {
      cids: {
        image: imageCid,
        metadata: metadataCid
      }
      }});

  } catch(error) {
    res.json({success: false});
  }
});

const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port)
});
