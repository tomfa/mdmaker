/*
 * Swear
 *
 * Replaces callback functions with Promises
 *
 * Example – reading a file with fs:
 *   const fs = require('fs');
 *
 *   const path = '/path/to/file.txt'
 *   const fileContent = await swear(fs.readFile, path)
 *
 * Example – creating an async method of fs.readFile
 *   const readFile = makePromise(fs.readFile);
 *
 *   const fileContent = await readFile(path);
 */

async function swear(oldFunction, args) {
  return new Promise((resolve, reject) => {
    try {
      oldFunction(args, (err, data) => (err ? reject(err) : resolve(data)));
    } catch (exception) {
      reject(exception);
    }
  });
}

function makePromise(oldFunction) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      try {
        oldFunction(...args, (err, data) =>
          err ? reject(err) : resolve(data)
        );
      } catch (exception) {
        reject(exception);
      }
    });
  };
}

module.exports = { swear, makePromise };
