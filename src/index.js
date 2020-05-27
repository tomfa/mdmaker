const argv = require("yargs")
  .example(
    "yarn convert wordpress.xml",
    "generates markdown files based on wordpress xml export"
  )
  .alias("f", "folder-format")
  .default("f", "yyyy-mm-dd-slug")
  .describe("f", "Format of output folders.")
  .alias("i", "filter-images")
  .default("i", "^http.*.(png|jpg)")
  .describe(
    "i",
    "Regex filter for which linked images to download and replace urls."
  )
  .alias("p", "parser")
  .default("p", "wordpress-xml")
  .describe("p", "Which parser to use for parsing input file.")
  .alias("t", "template")
  .default("t", "gatsby-remark.md")
  .describe("t", "Which template to use for generating files.")
  .help("h")
  .alias("h", "help").argv;
