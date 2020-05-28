const swear = require("../utils/promiser").swear;
const xml2js = require("xml2js");

const readFile = require("../utils/file-handler").readFile;
const ParseException = require("../utils/errors").ParseException;

async function process(path) {
  try {
    const parser = new xml2js.Parser();
    const data = await readFile(path);
    const result = await swear(parser.parseString, data);
    const xmlData = result.rss.channel[0].item;
    const getItem = (itemId) =>
      xmlData.find((d) => d["wp:post_id"].includes(itemId));
    const xmlPosts = xmlData.filter(
      (item) => item["wp:post_type"][0] === "post"
    );

    return xmlPosts.map((post) => parseXMLPost(post, getItem));
  } catch (err) {
    throw new ParseException(`Unable to read ${path}: ${err}`);
  }
}

function parseXMLPost(post, getItem) {
  const author = post["dc:creator"][0];
  const url = post.guid[0]["_"];
  const title = post.title[0];
  const publishedDate = new Date(post.pubDate);
  const content = post["content:encoded"][0];
  const status = post["wp:status"][0];
  const slug = post["wp:post_name"][0];
  const image = parseFeaturedImageUrl(post, getItem);

  const categories = parseCategories(post);
  const tags = parseTags(post);
  const filePaths = getFilePaths(content);

  return {
    author,
    url,
    title,
    date: publishedDate,
    image,
    content,
    status,
    slug,
    categories,
    tags,
    filePaths,
  };
}

function getFilePaths(content) {
  /*
   * Returns all url paths that can be considered to be downloaded and replaced
   * */
  const filePattern = new RegExp('(?:src="(.*?)")', "gi");
  const matches = [];

  let m;
  while ((m = filePattern.exec(content)) !== null) {
    matches.push(m[1]);
  }

  return matches;
}

function parseCategories(post) {
  const xmlCategories = post.category || [];
  return xmlCategories
    .filter((c) => c.$.domain === "category")
    .map((c) => c._)
    .filter((c) => c !== "Uncategorized");
}

function parseTags(post) {
  const xmlCategories = post.category || [];
  return xmlCategories
    .filter((c) => c.$.domain === "post_tag")
    .map((c) => c._)
    .filter((c) => c !== "Uncategorized");
}

function getFeatureId(post) {
  const metaData = post["wp:postmeta"] || [];

  const thumbnailMeta = metaData.find(
    (m) => m["wp:meta_key"][0] === "_thumbnail_id"
  );
  return thumbnailMeta && thumbnailMeta["wp:meta_value"][0];
}

function parseFeaturedImageUrl(post, getItem) {
  const itemId = getFeatureId(post);
  const item = itemId && getItem(itemId);

  return (item && item.guid[0]._) || "";
}

module.exports = process;
