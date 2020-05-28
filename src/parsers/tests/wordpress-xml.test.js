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
    expect(posts.length).toBe(1);
  });

  test("parses content to html", () => {
    assert(post.content.includes("<li>Search for slack</li>"));
  });

  test("identifies wordpress title and slug", () => {
    const { slug, title } = posts[0];

    expect(slug).toBe("adding-freshdesk-to-slack");
    expect(title).toBe("Adding Freshdesk to Slack");
  });

  test("identifies post status", () => {
    const { status } = posts[0];

    expect(status).toBe("publish");
  });

  test("returns a Date object for 'date'", () => {
    const post = posts[0];
    expect(post.date).toBeInstanceOf(Date);
  });

  test("finds img urls in content", () => {
    const post = posts[0];
    expect(post.filePaths).toEqual([
      "http://notes.webutvikling.org/wp-content/uploads/2016/08/Screen-Shot-2016-08-02-at-15.27.24-300x98.png",
    ]);
  });

  test("finds find tag", () => {
    const post = posts[0];
    expect(post.tags).toEqual(["freshdesk", "slack"]);
  });

  test("finds find categories", () => {
    const post = posts[0];
    expect(post.categories).toEqual(["Slack"]);
  });
});
