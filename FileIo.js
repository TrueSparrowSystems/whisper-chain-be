const http = require('https');
const fs = require('fs');
const { uuid } = require('uuidv4');

class FileIo {
  download(fileUrl, extension) {
    const filePath = `/tmp/${uuid()}.${extension}`;

    const file = fs.createWriteStream(filePath);

    return new Promise(function(onResolve) {
      const request = http.get(fileUrl, function(response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
          file.close();
          onResolve(filePath)
        });
      });
    });
  }
}

module.exports = FileIo;
