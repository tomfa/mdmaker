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

const IMAGE_FILE_EXT = [
  "apng",
  "bmp",
  "gif",
  "cur",
  "ico",
  "jpg",
  "jpeg",
  "jfif",
  "pjpeg",
  "pjp",
  "png",
  "svg",
  "webp",
];

let fileExtRegex = "(?:\\." + IMAGE_FILE_EXT.join("|") + ")";
let hrefRegex = `(?:href="(http.*?${fileExtRegex}))"`;
let imgRegex = '(?:src="(http.*?)")';
let defaultRegex = `${imgRegex}|${hrefRegex}`;

function extractUrls({ content, regexp = defaultRegex, filterDomain } = {}) {
  const filePattern = new RegExp(regexp, "gi");
  const matches = [];

  let m;
  while ((m = filePattern.exec(content)) !== null) {
    matches.push(m.slice(1).find((u) => !!u));
  }

  return matches.filter((m) => (filterDomain ? m.includes(filterDomain) : m));
}

module.exports = { extractUrls, makeUrlsRelative };
