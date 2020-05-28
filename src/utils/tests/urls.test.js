const { makeUrlsRelative } = require("../urls");

describe("urls utils", () => {
  describe("makeUrlsRelative", () => {
    test("changes urls to relative", () => {
      const content = '<img src="http://google.com/image.png" />';
      const urls = ["http://google.com/image.png"];
      expect(makeUrlsRelative({ content, urls })).toBe(
        '<img src="./image.png" />'
      );
    });
    test("allows added custom url prefix", () => {
      const content = '<img src="http://google.com/image.png" />';
      const urls = ["http://google.com/image.png"];
      expect(makeUrlsRelative({ content, urls, pathPrefix: "./images/" })).toBe(
        '<img src="./images/image.png" />'
      );
    });
    test("ignores other urls", () => {
      const content = '<img src="http://google.com/image.png" />';
      const urls = [];
      expect(makeUrlsRelative({ content, urls })).toBe(content);
    });
  });
});
