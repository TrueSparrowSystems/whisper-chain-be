const fs = require('fs');
const { uuid } = require('uuidv4');
const execSync = require('child_process').execSync;
const AWS = require('aws-sdk');

class GenerateAndUploadImages {
  constructor(params) {
    const oThis = this;

    oThis.prompt = params.prompt;
    oThis.artStyle = params.artStyle;
    oThis.dataDir = `/tmp/${uuid()}`;
  }

  async perform() {
    const oThis = this;

    oThis._validateAndSanitize();

    const imageFilePaths = await oThis._fetchImage();

    if (!imageFilePaths.length) {
      return [];
    }

    const s3Locations = await oThis._uploadImagesToS3(imageFilePaths);

    await oThis._removeDirectory(oThis.dataDir);

    return s3Locations;
  }

  _validateAndSanitize() {
    const oThis = this;

    if (!oThis.prompt) {
      throw new Error('Prompt is empty');
    }

    oThis.prompt = oThis.prompt.replace('.', '');
    oThis.prompt = oThis.prompt.replaceAll('"', '');

    oThis.prompt = '"' + `${oThis.prompt}` + '"';
    oThis.prompt = oThis.artStyle ? `${oThis.prompt}, ${oThis.artStyle}` : oThis.prompt;
  }

  async _fetchImage() {
    const oThis = this;

    let imageFIlePaths;
    try {
      imageFIlePaths = await oThis._stabilityApiCall();
      return imageFIlePaths;
    } catch (e) {
      console.log('--------------------- Stability API Error ----------------', e.toString('utf8'));

      const error = e.toString('utf8');
      if (error.includes('Invalid prompts detected')) {
        throw new Error('Invalid prompts detected');
      } else {
        throw new Error('Failed to generate image');
      }
    }
  }

  async _stabilityApiCall() {
    const oThis = this;

    execSync(`mkdir ${oThis.dataDir}`);

    execSync(`python3 -m stability_sdk.client -W 512 -H 512 -n 2 ${oThis.prompt}`, {
      shell: true,
      cwd: `${oThis.dataDir}`,
      env: Object.assign({}, process.env, {
        STABILITY_KEY: process.env.STABILITY_API_KEY,
        NODE_PATH: process.cwd() + '/node_modules'
      })
    });

    let imageFilePaths = [];

    const fileNames = fs.readdirSync(oThis.dataDir);

    for (let fileName of fileNames) {
      if (fileName.endsWith('.png')) {
        imageFilePaths.push(`${oThis.dataDir}/${fileName}`);
      }
    }

    return imageFilePaths;
  }

  async _uploadImagesToS3(imageFilePaths) {
    const oThis = this;
    const promiseArray = [];
    for (const imageFilePath of imageFilePaths) {
      const fileName = uuid();

      promiseArray.push(oThis._putObject(`stability/${fileName}.png`, imageFilePath));
    }

    const responses = await Promise.all(promiseArray);
    const s3Urls = [];
    for (const response of responses) {
      s3Urls.push(response.url);
    }

    return s3Urls;
  }

  async _putObject(S3FilePath, filePath) {
    const oThis = this;

    const AWSS3 = await oThis._getInstance();

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: S3FilePath,
      Body: fs.createReadStream(filePath),
      ACL: 'public-read',
      ContentType: 'image/png'
    };
    console.log('_putObject--->');

    return new Promise(function(onResolve) {
      AWSS3.upload(params)
        .promise()
        .then(function(resp) {
          const location = { url: resp.Location || '' };
          onResolve(location);
        })
        .catch(function(err) {
          console.log('s3 upload error:', err);
        });
    });
  }

  async _removeDirectory(directory) {
    fs.rmdir(directory, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  async _getInstance() {
    const AWSInstance = new AWS.S3({
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    });

    return AWSInstance;
  }
}

module.exports = GenerateAndUploadImages;
