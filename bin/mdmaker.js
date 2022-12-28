#!/usr/bin/env node

const resolve = require("path").resolve;

const run = require("../src/index");
const urlUtils = require("../src/utils/urls");

const defaultParser = "./parsers/wordpress-xml";
const defaultTemplate = "./templates/gatsby.md";

const argv = require("yargs")
  .usage("yarn convert <input-file> [args]")
  .example(
    "yarn convert wordpress.xml",
    "generates markdown files based on wordpress xml export"
  )
  .alias("d", "download-images")
  .default("d", false)
  .describe("d", "Downloads images refernces to poot folder.")
  .boolean('d')
  .alias("f", "folder-format")
  .default("f", 'yyyy-mm-dd-"slug"')
  .describe("f", "Format of individual post folder name.")
  .alias("o", "output-dir")
  .default("o", "output")
  .describe("o", "Folder in which to put posts")
  .alias("i", "filter-images")
  .default("i", urlUtils.defaultRegex)
  .describe(
    "i",
    "Regex filter for which linked images to download and replace urls."
  )
  .alias("p", "parser")
  .default("p", defaultParser)
  .describe("p", "Which parser to use for parsing input file.")
  .alias("s", "filter-slug")
  .describe("s", "Specify post slug if wish to convert a single post")
  .alias("t", "template")
  .default("t", defaultTemplate)
  .describe("t", "Which template to use for generating files.")
  .help("h")
  .alias("h", "help").argv;

const parser = require(argv.parser !== defaultParser
  ? resolve(process.cwd(), argv.parser)
  : resolve(__dirname, `../src/${argv.parser}`));

const template =
  argv.template !== defaultTemplate
    ? resolve(process.cwd(), argv.template)
    : resolve(__dirname, `../src/${argv.template}`);

const { downloadImages, folderFormat, filterImages, outputDir, slug } = argv;
const inputArg = (argv._.length && argv._[0]) || null;

if (!inputArg) {
  console.log("Missing input file. Run with --help for assistance.");
  return;
}

const inputFile = resolve(process.cwd(), inputArg);

run({
  inputFile,
  downloadImages,
  folderFormat,
  filterImages,
  outputDir,
  parser,
  slugFilter: slug,
  templatePath: template,
});
