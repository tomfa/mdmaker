const fs = require("fs");
const http = require("http");
const https = require("https");

const FileWriteException = require("./errors").FileWriteException;

function downloadFiles({ urls, to }) {
  if (!urls || urls.length < 1) {
    return [];
  } else if (!to) {
    throw new FileWriteException("output folder not specified");
  }
  const files = urls.map((url) => {
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const path = `${to}/${fileName}`;
    return { url, path };
  });

  files.forEach(downloadFile);

  return files;
}

async function downloadFile({ url, path }) {
  console.log(`Storing ${path} from ${url}`);

  return new Promise((resolve, reject) => {
    try {
      const file = fs.createWriteStream(path);
      const web = url.startsWith("https") ? https : http;
      web
        .get(url, function(response) {
          response.pipe(file);
          file.on("finish", function() {
            file.close(resolve);
          });
        })
        .on("error", function(err) {
          fs.unlink(dest);
          reject(err.message);
        });
    } catch (error) {
      reject(error);
    }
  });
}

exports.readFile = fs.readFile;
exports.writeFile = fs.writeFile;
exports.downloadFiles = downloadFiles;
