const { getFolderName, createFolder } = require("../folders");
const { resolve } = require("path");
const fs = require("fs");

describe("folder utils", () => {
  let post;

  beforeAll(() => {
    post = {
      slug: "my-post-name",
      author: "author-name",
      date: new Date("2020", "0", "3"),
    };
  });

  describe("getFolderName", () => {
    const defaultFolderFormat = 'yyyy-mm-dd-"slug"';
    let defaultFolderName;

    beforeAll(() => {
      defaultFolderName = getFolderName(post, defaultFolderFormat);
    });

    test("Default folder name formats date", () => {
      expect(defaultFolderName.startsWith("2020-01-03")).toBe(true);
    });

    test('Replaces "slug" with slug of post', () => {
      expect(defaultFolderName.endsWith("-my-post-name")).toBe(true);
    });

    test('Replaces "author" with author of post', () => {
      const format = 'yyyy-mm-dd-"author"';

      const name = getFolderName(post, format);

      expect(name === "2020-01-03-author-name").toBe(true);
    });

    test("Allows custom text", () => {
      const format = 'yyyy-mm-dd-"author-i-am-superman"';

      const name = getFolderName(post, format);

      expect(name).toBe("2020-01-03-author-name-i-am-superman");
    });
  });

  describe("createFolder", () => {
    const folderName = resolve(__dirname, `./tmp`);
    const nestedFolderName = resolve(__dirname, `./tmp2/deep/nested`);

    const cleanUp = async () => {
      for (const folder of [folderName, nestedFolderName]) {
        if (fs.existsSync(folder)) {
          await fs.promises.rmdir(folder);
        }
      }
    };

    beforeAll(cleanUp); // In case of failed run

    test("creates a folder", async () => {
      expect(fs.existsSync(folderName)).toBe(false);

      await createFolder(folderName);

      expect(fs.existsSync(folderName)).toBe(true);
    });

    test("creates parent folders", async () => {
      expect(fs.existsSync(nestedFolderName)).toBe(false);

      await createFolder(nestedFolderName);

      expect(fs.existsSync(nestedFolderName)).toBe(true);
    });

    afterAll(cleanUp);
  });
});
