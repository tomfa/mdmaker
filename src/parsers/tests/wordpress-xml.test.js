const parseWordpressXML = require("../wordpress-xml");
const resolve = require("path").resolve;

const assert = (anything) => expect(anything).toBe(true);

describe("Wordpress XML parser", () => {
  const path = resolve(__dirname, "./export.xml");

  let posts;
  let post;

  beforeAll(async () => {
    posts = await parseWordpressXML(path);
    post = posts[0];
  });

  test("ignores non-post item", () => {
    assert(posts.length === 1);
  });

  test("parses content to html", () => {
    assert(post.content.includes("<li>Search for slack</li>"));
  });

  test("identifies wordpress title and slug", () => {
    const { slug, title } = post;

    assert(slug === "adding-freshdesk-to-slack");
    assert(title === "Adding Freshdesk to Slack");
  });

  test("extracts feature image url", () => {
    const { image } = post;

    assert(
      image ===
        "http://notes.webutvikling.org/wp-content/uploads/2016/08/freshdesk.jpg"
    );
  });

  test("identifies post status", () => {
    const { status } = post;

    assert(status === "publish");
  });

  test("returns a Date object for 'date'", () => {
    assert(post.date instanceof Date);
  });

  test("finds img urls in content", () => {
    expect(post.filePaths).toEqual([
      "http://notes.webutvikling.org/wp-content/uploads/2016/08/Screen-Shot-2016-08-02-at-15.27.24-300x98.png",
    ]);
  });

  test("finds find tag", () => {
    expect(post.tags).toEqual(["freshdesk", "slack"]);
  });

  test("finds find categories", () => {
    expect(post.categories).toEqual(["Slack"]);
  });
});
