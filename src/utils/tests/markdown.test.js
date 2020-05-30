const { htmlToMd } = require("../markdown");

function assertMdPrefixes([htmlTag, mdPrefix]) {
  const textNode = "header";
  const htmlContent = `<${htmlTag}>${textNode}</${htmlTag}>`;
  const mdContent = mdPrefix ? `${mdPrefix} ${textNode}` : `${textNode}`;
}

describe("markdown utils", () => {
  test("converts h1", () => {
    expect(htmlToMd("<h1>header</h1>")).toBe("header\n======");
  });

  test("converts images", () => {
    const htmlContent = `<img src="./fish.jpg" alt="A fish" />`;
    const mdContent = "![A fish](./fish.jpg)";

    expect(htmlToMd(htmlContent)).toBe(mdContent);
  });

  test("converts unordered lists", () => {
    const htmlContent = `<ul><li>a</li><li>b</li></ul>`;
    const mdContent = "*   a\n*   b";

    expect(htmlToMd(htmlContent)).toBe(mdContent);
  });

  test("converts ordered lists", () => {
    const htmlContent = `<ol><li>a</li><li>b</li></ol>`;
    const mdContent = "1.  a\n2.  b";

    expect(htmlToMd(htmlContent)).toBe(mdContent);
  });

  test("converts pre blocks", () => {
    const htmlContent = `
    <pre>This is some code</pre>
    `;
    const mdContent = "```\nThis is some code\n```";

    expect(htmlToMd(htmlContent)).toBe(mdContent);
  });

  test("converts pre+code blocks", () => {
    const htmlContent = `
    <pre><code>This is some code</code></pre>
    `;
    const mdContent = "```\nThis is some code\n```";

    expect(htmlToMd(htmlContent)).toBe(mdContent);
  });
});
