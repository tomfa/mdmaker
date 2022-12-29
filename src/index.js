const { downloadFiles, readFile, writeFile } = require("./utils/file-handler");
const urlUtils = require("./utils/urls");
const { getFolderName, createFolder } = require("./utils/folders");
const { htmlToMd } = require("./utils/markdown");
const { insertVariables } = require("./utils/templates");
const logger = require("./utils/logger");

async function convertPost({
  post,
  template,
  templatePath,
  outputDir,
  folderFormat,
  downloadImages,
  filterImages,
  globalImageFolder,
}) {
  if (!post) {
    throw new Error(`Attempting to convert without specifying page or post`)
  }
  const log = logger.createLogger(`(${post.title})`);
  const baseUrl = urlUtils.findBaseUrl(post.url);
  log.debug(`Converting ${post ? 'post' : 'page'}: ${post.url}`);
  const postFolder = getFolderName(post, folderFormat);
  const outputFolder = `${outputDir}/${postFolder}`;
  const imageFolder = globalImageFolder || outputFolder;

  log.info(`Storing -> ${outputFolder}`);
  await createFolder(outputFolder);
  if (globalImageFolder) {
    await createFolder(globalImageFolder);
  }

  let htmlContent = post.content;

  if (downloadImages) {
    // Find files to download
    htmlContent = urlUtils.makeUrlsAbsolute({
      content: post.content,
      path: post.url,
    });

    const fileUrls = urlUtils.extractUrls({
      content: htmlContent + (post.image ? ` <img src="${post.image}" />` : ""),
      filterDomain: baseUrl,
      regexp: filterImages,
    });
    log.debug(`Found ${fileUrls.length} images with baseUrl ${baseUrl}`);

    // Download files
    await downloadFiles({ urls: fileUrls, to: imageFolder, log });

    const imagePathPrefix = globalImageFolder ? `/${globalImageFolder}/` : `./`;
    // Make downloaded files references as local files
    post.image = urlUtils.makeUrlRelative({ url: post.image, pathPrefix: imagePathPrefix });
    const urlMapping = fileUrls.map((url) => ({
      external: url,
      internal: urlUtils.makeUrlRelative({ url, pathPrefix: imagePathPrefix }),
    }));
    urlMapping.forEach(
      (m) => (htmlContent = htmlContent.replace(m.external, m.internal))
    );
  }

  // Write as markdown
  const markdownContent = htmlToMd(htmlContent);
  const content = insertVariables({
    template,
    variables: { ...post, content: markdownContent, html: htmlContent },
  });
  const templateExt = templatePath.split(".").reverse()[0];
  await writeFile(`${outputFolder}/index.${templateExt}`, content);
  return {...post, path: postFolder }
}

async function convert({
  inputFile,
  slugFilter,
  templatePath,
  parser,
  outputDir,
  folderFormat,
  downloadImages,
  filterImages,
  globalImageFolder,
}) {
  logger.debug(`Parsing input`, inputFile);
  if (slugFilter) {
    logger.debug("...filtering posts by slug", slugFilter);
  }
  const parseResult = await parser(inputFile);
  const posts = parseResult.posts.filter(
    (p) => !slugFilter || p.slug === slugFilter
  );
  const pages = parseResult.pages.filter(
    (p) => !slugFilter || p.slug === slugFilter
  );

  logger.debug(`Loading template`, templatePath);
  const template = await readFile(templatePath, "utf-8");

  logger.debug("Using options:", {
    outputDir,
    folderFormat,
    downloadImages,
    filterImages,
    globalImageFolder: downloadImages && globalImageFolder,
  });
  logger.info(`Converting ${posts.length} posts and ${pages.length} pages...`);

  const metadata = await Promise.all(
    [...posts, ...pages].map(async (post) =>
      convertPost({
        post,
        template,
        templatePath,
        outputDir,
        folderFormat,
        downloadImages,
        filterImages,
        globalImageFolder,
      })
    )
  );

  logger.info(`Writing metadata file to ${outputDir}/meta.json`)
  await writeFile(`${outputDir}/meta.json`, JSON.stringify(metadata));
}

module.exports = convert;
