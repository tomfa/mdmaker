const resolve = require("path").resolve;

const { downloadFiles, readFile, writeFile } = require("./utils/file-handler");
const urlUtils = require("./utils/urls");
const { getFolderName, createFolder } = require("./utils/folders");
const { htmlToMd } = require("./utils/markdown");
const { insertVariables } = require("./utils/templates");

const argv = require("yargs")
  .usage("yarn convert <input-file> [args]")
  .example(
    "yarn convert wordpress.xml",
    "generates markdown files based on wordpress xml export"
  )
  .alias("f", "folder-format")
  .default("f", 'yyyy-mm-dd-"slug"')
  .describe("f", "Format of post folder name.")
  .alias("o", "output-dir")
  .default("o", "output")
  .describe("o", "Folder in which to put markdown posts")
  .alias("i", "filter-images")
  .default("i", "^http.*.(png|jpg)")
  .describe(
    "i",
    "Regex filter for which linked images to download and replace urls."
  )
  .alias("p", "parser")
  .default("p", resolve(__dirname, "./parsers/wordpress-xml"))
  .describe("p", "Which parser to use for parsing input file.")
  .alias("post", "post-filter")
  .describe("post", "Specify post slug if wish to convert a single post")
  .alias("t", "template")
  .default("t", resolve(__dirname, "./templates/gatsby.md"))
  .describe("t", "Which template to use for generating files.")
  .help("h")
  .alias("h", "help").argv;

const parser = require(argv.parser);
const { template, folderFormat, filterImages, outputDir, postFilter } = argv;
const inputFile = (argv._.length && argv._[0]) || null;

if (!inputFile) {
  console.log("Missing input file. Run with --help for assistance.");
  return;
}

async function run() {
  const posts = (await parser(inputFile)).filter(p => (!postFilter) || p.slug === postFilter);
  const markdownTemplate = await readFile(template, "utf-8");

  console.log(`Converting ${posts.length} posts...`);
  posts.forEach(async (post) => {
    const baseUrl = urlUtils.findBaseUrl(post.url);
    const postFolder = getFolderName(post, folderFormat);
    const outputFolder = `${outputDir}/${postFolder}`;

    console.log(`Creating ${outputFolder}`);
    await createFolder(outputFolder);

    // Download extra files
    let htmlContent = urlUtils.makeUrlsAbsolute({
      content: post.content,
      path: post.url,
    });

    const fileUrls = urlUtils.extractUrls({
      content: htmlContent + (post.image ? ` <img src="${post.image}" />` : ""),
      filterDomain: baseUrl,
    });
    post.image = urlUtils.makeUrlRelative({ url: post.image });

    downloadFiles({ urls: fileUrls, to: outputFolder });

    // Make downloaded files references as local files
    const urlMapping = fileUrls.map((url) => ({
      external: url,
      internal: urlUtils.makeUrlRelative({ url }),
    }));
    urlMapping.forEach(
      (m) => (htmlContent = htmlContent.replace(m.external, m.internal))
    );

    // Write as markdown
    const markdownContent = htmlToMd(htmlContent);
    const content = insertVariables({
      template: markdownTemplate,
      variables: { ...post, content: markdownContent },
    });
    const templateExt = template.split(".").reverse()[0];
    await writeFile(`${outputFolder}/index.${templateExt}`, content);
  });
}

run();
