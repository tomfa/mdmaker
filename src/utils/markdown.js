const TurndownService = require("turndown");
const turndownService = new TurndownService({ codeBlockStyle: "fenced" });

turndownService.addRule("pre-is-code", {
  filter: ["pre"],
  replacement: function(content) {
    return "\n\n```\n" + content + "\n```\n\n";
  },
});

function htmlToMd(html) {
  return turndownService.turndown(html);
}

module.exports = { htmlToMd };
