const { downloadFiles, readFile, writeFile } = require("./utils/file-handler");
const urlUtils = require("./utils/urls");
const { getFolderName, createFolder } = require("./utils/folders");
const { htmlToMd } = require("./utils/markdown");
const { insertVariables } = require("./utils/templates");

async function convertPost({
  post,
  template,
  templatePath,
  outputDir,
  folderFormat,
  downloadImages,
  filterImages,
}) {
  const baseUrl = urlUtils.findBaseUrl(post.url);
  const postFolder = getFolderName(post, folderFormat);
  const outputFolder = `${outputDir}/${postFolder}`;

  console.log(`Converting ${post.slug} -> ${outputDir}`);
  await createFolder(outputFolder);

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

    // Download files
    downloadFiles({ urls: fileUrls, to: outputFolder });

    // Make downloaded files references as local files
    post.image = urlUtils.makeUrlRelative({ url: post.image });
    const urlMapping = fileUrls.map((url) => ({
      external: url,
      internal: urlUtils.makeUrlRelative({ url }),
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
}) {
  const posts = (await parser(inputFile)).filter(
    (p) => !slugFilter || p.slug === slugFilter
  );
  const template = await readFile(templatePath, "utf-8");

  console.log(`Converting ${posts.length} posts...`);
  await Promise.all(
    posts.map(async (post) =>
      convertPost({
        post,
        template,
        templatePath,
        outputDir,
        folderFormat,
        downloadImages,
        filterImages,
      })
    )
  );
}

module.exports = convert;
