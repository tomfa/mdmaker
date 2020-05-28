const dateFormat = require("dateformat");

function getFolderName(post, folderFormat) {
  return dateFormat(post.date, folderFormat.replace("slug", `"${post.slug}"`));
}

module.exports = {
  getFolderName,
};
