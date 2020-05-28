const { getFolderName } = require("../folders");

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
});
