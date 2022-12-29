const fs = require("fs");
const http = require("http");
const https = require("https");
const logger = require("./logger");

const { makePromise } = require("./promiser");

const FileWriteException = require("./errors").FileWriteException;

async function downloadFiles({ urls, to, log }) {
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

  await Promise.all(
    files.map(({ url, path }) => downloadFile({ url, path, log }))
  );

  return files;
}

async function downloadFile({ url, path, log }) {
  log.debug(`Downloading ${url} -> ${path}`);
  return new Promise((resolve, reject) => {
    try {
      const file = fs.createWriteStream(path);
      const web = url.startsWith("https") ? https : http;
      web
        .get(url, function (response) {
          response.pipe(file);
          file.on("finish", function () {
            file.close(resolve);
          });
        })
        .on("error", function (err) {
          fs.unlink(dest);
          reject(err.message);
        });
    } catch (error) {
      log.info(`Errored while downloading ${url} to ${path}`);
      log.info(error);
      reject(error);
    }
  });
}

exports.readFile = makePromise(fs.readFile);
exports.writeFile = makePromise(fs.writeFile);
exports.downloadFiles = downloadFiles;
