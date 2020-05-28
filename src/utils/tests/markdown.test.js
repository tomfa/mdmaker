const { htmlToMd } = require("../markdown");

const assert = (anything) => expect(anything).toBe(true);

function assertMdPrefixes([htmlTag, mdPrefix]) {
  const textNode = "header";
  const htmlContent = `<${htmlTag}>${textNode}</${htmlTag}>`;
  const mdContent = mdPrefix ? `${mdPrefix} ${textNode}` : `${textNode}`;

  assert(htmlToMd(htmlContent) === mdContent);
}

describe("markdown utils", () => {
  test("converts headings", () => {
    const headings = {
      h1: "#",
      h2: "##",
      h3: "###",
      h4: "####",
      h5: "#####",
      h6: "######",
    };

    Object.entries(headings).forEach(assertMdPrefixes);
  });

  test("converts images", () => {
    const htmlContent = `<img src="./fish.jpg" alt="A fish" />`;
    const mdContent = "![A fish](./fish.jpg)";

    assert(htmlToMd(htmlContent) === mdContent);
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
});
