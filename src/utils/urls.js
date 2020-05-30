function makeUrlRelative({ url, pathPrefix = "./" }) {
  if (!url || !url.startsWith("http")) {
    return url;
  }
  const name = url.split("/").reverse()[0];
  return pathPrefix + name;
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

let fileExtRegex = "(?:\\.(?:" + IMAGE_FILE_EXT.join("|") + "))";
let hrefRegex = `(?:href="(http[^"]*?${fileExtRegex}))"`;
let imgRegex = '(?:src="(http[^"]*?)")';

const defaultRegex = `${imgRegex}|${hrefRegex}`;

function extractUrls({ content, regexp = defaultRegex, filterDomain } = {}) {
  const filePattern = new RegExp(regexp, "gi");
  const matches = [];

  let m;
  while ((m = filePattern.exec(content)) !== null) {
    matches.push(m.slice(1).find((u) => !!u));
  }

  return matches.filter((m) => (filterDomain ? m.includes(filterDomain) : m));
}

function findBaseUrl(url) {
  return url && url.split("/", 3).join("/");
}

function makeUrlsAbsolute({ content, path } = {}) {
  if (!content) {
    return "";
  }
  let url = path.endsWith("/") ? path : `${path}/`;
  let baseUrl = findBaseUrl(url);
  let cleanedContent = content;
  const filePattern = new RegExp(/(?:(src|href)="((?:\/|\.).*?)")/, "gi");

  let m;
  while ((m = filePattern.exec(content)) !== null) {
    let absoluteUrl = m[2].startsWith("/") ? baseUrl + m[2] : url + m[2];
    absoluteUrl = absoluteUrl.replace("/./", "/");
    cleanedContent = cleanedContent.replace(m[0], `${m[1]}="${absoluteUrl}"`);
  }

  return cleanedContent;
}

module.exports = {
  defaultRegex,
  extractUrls,
  findBaseUrl,
  makeUrlRelative,
  makeUrlsAbsolute,
};
