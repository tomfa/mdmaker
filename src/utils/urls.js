function cleanUrl({ url, pathPrefix }) {
  // Accepts an url and returns the last part, prepended b
  if (!url) {
    return;
  }
  const name = url.split("/").reverse()[0];
  return pathPrefix + name;
}

function makeUrlsRelative({ content, urls, pathPrefix = "./" }) {
  let cleanedContent = content;
  urls.forEach((url) => {
    cleanedContent = cleanedContent.replace(url, cleanUrl({ url, pathPrefix }));
  });
  return cleanedContent;
}

module.exports = { makeUrlsRelative };
