const fs = require("fs");
const dateFormat = require("dateformat");

function getFolderName(post, folderFormat) {
  const postPath = dateFormat(post.date, folderFormat)
    .replace("slug", post.slug)
    .replace("author", post.author);
  if (!post.subfolder) {
    return postPath
  }
  return `${post.subfolder}/${postPath}`
}
function createFolder(path) {
  return fs.promises.mkdir(path, { recursive: true });
}

module.exports = {
  getFolderName,
  createFolder,
};
