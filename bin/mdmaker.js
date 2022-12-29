#!/usr/bin/env node

const resolve = require("path").resolve;

const run = require("../src/index");
const urlUtils = require("../src/utils/urls");

const defaultParser = "./parsers/wordpress-xml";
const defaultTemplate = "./templates/gatsby.md";
const logger = require('../src/utils/logger')

const argv = require("yargs")
  .usage("mdex <input-file> [args]")
  .example(
    "mdex wordpress.xml",
    "Generates markdown files based on wordpress xml export"
  )
  .example(
    "mdex wordpress.xml -d",
    "Downloads linked images (hosted on same domain) to same folder as post."
  )
  .example('mdex export.xml --template=my-template.mdx', 'Export content to custom template. See also --template-args.')
  .describe('template-args', 'Print args available in custom template')
  .boolean('template-args')
  .alias("d", "download-images")
  .default("d", false)
  .describe("d", "Downloads images references to post folder.")
  .boolean("d")
  .describe("debug", "Log for debug purposes")
  .default("debug", false)
  .boolean("debug")
  .alias("f", "folder-format")
  .default("f", 'yyyy-mm-dd-"slug"')
  .describe("f", "Format of individual post folder name.")
  .alias("o", "output-dir")
  .default("o", "output")
  .describe("o", "Folder in which to put posts")
  .alias("g", "global-image-folder")
  .describe("g", "Specify a path to download all images to. Requires -d")
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

logger.setDebug(argv.debug);

const parsePath = argv.parser !== defaultParser
  ? resolve(process.cwd(), argv.parser)
  : resolve(__dirname, `../src/${argv.parser}`);

const template =
  argv.template !== defaultTemplate
    ? resolve(process.cwd(), argv.template)
    : resolve(__dirname, `../src/${argv.template}`);

if (argv.templateArgs) {
  logger.info('\nAvailable template args to use with custom template:')

  logger.info('  {{ title }}    Title of post')
  logger.info('  {{ date }}     Date post is published')
  logger.info('  {{ image }}    Absolute URL of post main image')
  logger.info('  {{ tags }}     Post tags, e.g')
  logger.info('  {{ author }}   Author of post')
  logger.info('  {{ status }}   e.g. publish')
  logger.info('  {{ content }}  Content of post in .md format\n')
}

const { downloadImages, folderFormat, filterImages, outputDir, slug, globalImageFolder } = argv;
const inputArg = (argv._.length && argv._[0]) || null;

if (!inputArg) {
  logger.info("Missing input file. Run with --help for assistance.");
  return;
}

if (globalImageFolder && !downloadImages) {
  logger.info("Can not specify --global-image-folder with --download-images=false")
  return;
}

logger.debug(`Using parser: ${parsePath}`);
const parser = require(parsePath);

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
  globalImageFolder
});
