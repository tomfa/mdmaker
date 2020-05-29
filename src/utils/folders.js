const fs = require("fs");
const dateFormat = require("dateformat");

function getFolderName(post, folderFormat) {
  return dateFormat(post.date, folderFormat)
    .replace("slug", post.slug)
    .replace("author", post.author);
}
function createFolder(path) {
  return fs.promises.mkdir(path, { recursive: true });
}

module.exports = {
  getFolderName,
  createFolder,
};
