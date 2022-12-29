const parseWordpressXML = require("../wordpress-xml");
const resolve = require("path").resolve;

describe("Wordpress XML parser", () => {
  const path = resolve(__dirname, "./export.xml");

  let posts;
  let post;
  let pages;
  let page;
  let attachments;

  beforeAll(async () => {
    const result = await parseWordpressXML(path);
    posts = result.posts;
    post = posts[0]
    pages = result.pages;
    page = pages[0]
    attachments = result.attachments;
  });

  test("ignores non-post item", () => {
    expect(posts.length).toBe(1);
    expect(pages.length).toBe(1);
    expect(attachments.length).toBe(1);
  });

  test("parses post content to html", () => {
    expect(post.content).toContain("<li>Search for slack</li>");
  });
  test("parses page content to html", () => {
    expect(page.content).toContain("<strong>Ellingsøya Hornmusikk ble stiftet 1962 og har i 2012 19 medlemmer.</strong>");
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
