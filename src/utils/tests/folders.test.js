const { getFolderName, createFolder } = require("../folders");
const { resolve } = require("path");
const fs = require("fs");

const assert = (anything) => expect(anything).toBe(true);

describe("folder utils", () => {
  let post;

  beforeAll(() => {
    post = {
      slug: "my-post-name",
      date: new Date("2020", "0", "3"),
    };
  });

  describe("getFolderName", () => {
    const defaultFolderFormat = "yyyy-mm-dd-slug";
    let defaultFolderName;

    beforeAll(() => {
      defaultFolderName = getFolderName(post, defaultFolderFormat);
    });

    test("Default folder name formats date", () => {
      assert(defaultFolderName.startsWith("2020-01-03"));
    });

    test("Replaces slug with slug of post", () => {
      assert(defaultFolderName.endsWith("-my-post-name"));
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
      expect(!fs.existsSync(folderName)).toBe(true);

      await createFolder(folderName);

      expect(fs.existsSync(folderName)).toBe(true);
    });

    test("creates parent folders", async () => {
      expect(!fs.existsSync(nestedFolderName)).toBe(true);

      await createFolder(nestedFolderName);

      expect(fs.existsSync(nestedFolderName)).toBe(true);
    });

    afterAll(cleanUp);
  });
});
