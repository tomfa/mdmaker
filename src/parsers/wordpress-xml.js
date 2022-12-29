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
    const posts = xmlData.filter(
      (item) => item["wp:post_type"][0] === "post"
    ).map((post) => parseXMLPost(post, getItem));
    const pages = xmlData.filter(
      (item) => item["wp:post_type"][0] === "page"
    ).map(page => parseXMLPage(page, getItem));
    const attachments = xmlData.filter(
      (item) => item["wp:post_type"][0] === "attachment"
    ).map(attachment => parseXMLAttachment(attachment));

    return { posts, pages, attachments }
  } catch (err) {
    throw new ParseException(`Unable to read ${path}: ${err}`);
  }
}

function parseXMLAttachment(attachment) {
  const author = attachment["dc:creator"][0];
  const url = attachment.guid[0]["_"];
  const title = attachment.title[0];
  let publishedDate = new Date(attachment.pubDate);
  if (isNaN(publishedDate)) {
    publishedDate = new Date(attachment["wp:post_date"]);
  }
  const content = attachment["content:encoded"][0]?.trim();
  const status = attachment["wp:status"][0]?.trim();
  let slug = attachment["wp:post_name"][0]?.trim();
  if (!slug) {
    slug = attachment.title[0]
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  const categories = parseCategories(attachment);
  const tags = parseTags(attachment);

  return {
    author,
    url,
    title,
    date: publishedDate,
    content,
    status,
    slug,
    categories,
    tags,
  };
}

function parseXMLPage(page, getItem) {
  return parseXMLPost(page, getItem);
}

function parseXMLPost(post, getItem) {
  const author = post["dc:creator"][0];
  const url = post.guid[0]["_"];
  const title = post.title[0]?.trim();
  let publishedDate = new Date(post.pubDate);
  if (isNaN(publishedDate)) {
    publishedDate = new Date(post["wp:post_date"]);
  }
  const content = post["content:encoded"][0];
  const status = post["wp:status"][0].trim();
  let slug = post["wp:post_name"][0].trim();
  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  const image = parseFeaturedImageUrl(post, getItem);

  const categories = parseCategories(post);
  const tags = parseTags(post);

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
  };
}

function parseCategories(post) {
  const xmlCategories = post.category || [];
  return xmlCategories
    .filter((c) => c.$.domain === "category")
    .map((c) => c._.trim())
    .filter((c) => c !== "Uncategorized");
}

function parseTags(post) {
  const xmlCategories = post.category || [];
  return xmlCategories
    .filter((c) => c.$.domain === "post_tag")
    .map((c) => c._.trim())
    .filter((c) => c !== "Uncategorized");
}

function getFeatureId(post) {
  const metaData = post["wp:postmeta"] || [];

  const thumbnailMeta = metaData.find(
    (m) => m["wp:meta_key"][0] === "_thumbnail_id"
  );
  return thumbnailMeta && thumbnailMeta["wp:meta_value"][0]?.trim();
}

function parseFeaturedImageUrl(post, getItem) {
  const itemId = getFeatureId(post);
  const item = itemId && getItem(itemId);

  return (item && item.guid[0]._?.trim()) || "";
}

module.exports = process;
