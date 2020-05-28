const toMarkdown = require("to-markdown");

function htmlToMd(html) {
  const markdown = toMarkdown(html);
  return cleanContent(markdown);
}

function cleanContent(markdownContent) {
  // Replaces characters that are misinterpreted by Markdown

  return markdownContent
    .replace(/[\u2018|\u2019|\u201A]/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[\u201C|\u201D|\u201E]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[\u2013|\u2014]/g, "-")
    .replace(/\u02C6/g, "^")
    .replace(/\u2039/g, "<")
    .replace(/&lt;/g, "<")
    .replace(/\u203A/g, ">")
    .replace(/&gt;/g, ">")
    .replace(/[\u02DC|\u00A0]/g, " ")
    .replace(/&amp;/g, "&");
}

module.exports = { htmlToMd };
