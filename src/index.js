const { downloadFiles, readFile, writeFile } = require("./utils/file-handler");
const urlUtils = require("./utils/urls");
const { getFolderName, createFolder } = require("./utils/folders");
const { htmlToMd } = require("./utils/markdown");
const { insertVariables } = require("./utils/templates");
const logger = require("./utils/logger");

async function convertPost({
  post,
  page,
  template,
  templatePath,
  outputDir,
  folderFormat,
  downloadImages,
  filterImages,
  globalImageFolder,
}) {
  const data = post || page;
  if (!data) {
    throw new Error(`Attempting to convert without specifying page or post`)
  }
  const log = logger.createLogger(`(${data.title})`);
  const baseUrl = urlUtils.findBaseUrl(data.url);
  log.debug(`Converting ${post ? 'post' : 'page'}: ${data.url}`);
  const postFolder = getFolderName(data, folderFormat);
  const outputFolder = `${outputDir}/${postFolder}`;
  const imageFolder = globalImageFolder || outputFolder;

  log.info(`Storing -> ${outputFolder}`);
  await createFolder(outputFolder);
  if (globalImageFolder) {
    await createFolder(globalImageFolder);
  }


  let htmlContent = data.content;

  if (downloadImages) {
    // Find files to download
    htmlContent = urlUtils.makeUrlsAbsolute({
      content: data.content,
      path: data.url,
    });

    const fileUrls = urlUtils.extractUrls({
      content: htmlContent + (data.image ? ` <img src="${data.image}" />` : ""),
      filterDomain: baseUrl,
      regexp: filterImages,
    });
    log.debug(`Found ${fileUrls.length} images with baseUrl ${baseUrl}`);

    // Download files
    await downloadFiles({ urls: fileUrls, to: imageFolder, log });

    const imagePathPrefix = globalImageFolder ? `/${globalImageFolder}/` : `./`;
    // Make downloaded files references as local files
    data.image = urlUtils.makeUrlRelative({ url: data.image, pathPrefix: imagePathPrefix });
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
    variables: { ...data, content: markdownContent, html: htmlContent },
  });
  const templateExt = templatePath.split(".").reverse()[0];
  await writeFile(`${outputFolder}/index.${templateExt}`, content);
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
  logger.info(`Converting ${posts.length} posts...`);

  await Promise.all(
    posts.map(async (post) =>
      convertPost({
        post,
        template,
        templatePath,
        outputDir: `${outputDir}/posts`,
        folderFormat,
        downloadImages,
        filterImages,
        globalImageFolder,
      })
    )
  );

  await Promise.all(
    pages.map(async (page) =>
      convertPost({
        page,
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
}

module.exports = convert;
