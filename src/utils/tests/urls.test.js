const utils = require("../urls");

describe("urls utils", () => {
  describe("makeUrlRelative", () => {
    test("changes urls to relative", () => {
      const url = "http://google.com/image.png";
      expect(utils.makeUrlRelative({ url })).toBe("./image.png");
    });
    test("allows added custom url prefix", () => {
      const url = "http://google.com/image.png";
      expect(utils.makeUrlRelative({ url, pathPrefix: "./images/" })).toBe(
        "./images/image.png"
      );
    });
    test("ignores already relative urls", () => {
      const url = "/image.png";
      expect(utils.makeUrlRelative({ url })).toBe(url);
    });
  });

  describe("makeUrlsAbsolute", () => {
    const content = `
      <a href="/">home</a>
      <img src="./relative-cat.jpg" />
      <a href="https://github.com">
        <img src="https://placekitten.com/408/287" />
      </a>
      `;
    const path = "http://mypage.com/post/mypost/";
    let cleaned;

    beforeAll(() => {
      cleaned = utils.makeUrlsAbsolute({ content, path });
    });

    test("replaces relative urls with absolute url", () => {
      expect(cleaned).toContain(`<a href="http://mypage.com/">home</a>`);
      expect(cleaned).toContain(
        `<img src="http://mypage.com/post/mypost/relative-cat.jpg" />`
      );
    });

    test("leaves non-relative urls as is", () => {
      expect(cleaned).toContain(`<a href="https://github.com">`);
      expect(cleaned).toContain(
        `<img src="https://placekitten.com/408/287" />`
      );
    });
  });

  describe("extractUrls", () => {
    const content = `
      <a href="#kitten"><h1 id="kitten">Want a cat?</h1></a> 
      <a href="https://placekitten.com/408/287/maxsize"> 
        <img src="https://placekitten.com/408/287" /> 
      </a>
      <a href="http://google.com/flamingo-large.jpg"/> 
        <img src="http://google.com/flamingo.jpg"/> 
      </a>
      <a href="../../img/digidog.png">
        <img src="./doggy-small.jpg" />
      </a>
      <img src="./CATZILLA.PNG" />
      <img src="logo.svg" />
      "There you go."`;

    test("returns img src", () => {
      expect(utils.extractUrls({ content })).toContain(
        "https://placekitten.com/408/287"
      );
      expect(utils.extractUrls({ content })).toContain(
        "http://google.com/flamingo.jpg"
      );
    });
    test("ignores #hashbang urls", () => {
      expect(utils.extractUrls({ content })).not.toContain("#kitten");
    });
    test("includes href links with file ending", () => {
      expect(utils.extractUrls({ content })).toContain(
        "http://google.com/flamingo-large.jpg"
      );
    });
    test("ignores href links without file ending", () => {
      expect(utils.extractUrls({ content })).not.toContain(
        "https://placekitten.com/408/287/maxsize"
      );
    });
    test("ignores relative urls", () => {
      expect(utils.extractUrls({ content })).not.toContain("./doggy-small.jpg");
      expect(utils.extractUrls({ content })).not.toContain("./logo.svg");
    });

    test("ignores href links followed by img", () => {
      const content = `
      <a href="https://google.com">Don't download me</a> please.
      <img src="http://unsplashed/google" />
      `;
      const urls = utils.extractUrls({ content });
      expect(urls.length).toBe(1);
      expect(urls).toContain("http://unsplashed/google");
    });

    test("filters urls if filterDomain is specified", () => {
      expect(
        utils.extractUrls({ content, filterDomain: "placekitten.com" })
      ).toContain("https://placekitten.com/408/287");
      expect(
        utils.extractUrls({ content, filterDomain: "google.com" })
      ).toContain("http://google.com/flamingo.jpg");
    });

    test("returns empty string if no matches found", () => {
      const content = "<h1>HI</h1>";
      expect(utils.extractUrls({ content })).toEqual([]);
    });

    test("can have regexp match overridden", () => {
      const content = "<h1>header</h1>";
      const regexp = "(?:>(.*?)<)";
      expect(utils.extractUrls({ content, regexp })).toEqual(["header"]);
    });
  });
});
