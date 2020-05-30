const parseWordpressXML = require("../wordpress-xml");
const resolve = require("path").resolve;

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
    expect(post.content).toContain("<li>Search for slack</li>");
  });

  test("identifies wordpress title and slug", () => {
    const { slug, title } = post;

    expect(slug).toBe("adding-freshdesk-to-slack");
    expect(title).toBe("Adding Freshdesk to Slack");
  });

  test("extracts feature image url", () => {
    const { image } = post;

    expect(image).toBe(
      "http://notes.webutvikling.org/wp-content/uploads/2016/08/freshdesk.jpg"
    );
  });

  test("identifies post status", () => {
    const { status } = post;

    expect(status).toBe("publish");
  });

  test("returns a Date object for 'date'", () => {
    expect(post.date instanceof Date).toBe(true);
  });

  test("finds find tag", () => {
    expect(post.tags).toEqual(["freshdesk", "slack"]);
  });

  test("finds find categories", () => {
    expect(post.categories).toEqual(["Slack"]);
  });
});
