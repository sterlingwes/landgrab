const prettier = require("prettier");
const { render } = require("./node-renderer");
const Bundler = require("parcel-bundler");

const testScript = `
  const { createElement } = require("./jsx-without-react");
  const container = (
    <div id="root">
      <div id="1">First</div>
      <div id="2">
        <div id="3">Second 1st child</div>
        <div id="4">Second 2nd child</div>
      </div>
      <div id="5">Third</div>
    </div>
  );

  document.body.appendChild(container);
`;

require("fs").writeFileSync("lib/test-bundle.js", testScript, {
  encoding: "utf8",
});

const entryFiles = require("path").join("./", "lib/test-bundle.js");
const options = {
  outDir: "./test-tmp",
  outFile: "test-bundle.js",
  logLevel: 1, // errors only
  contentHash: false,
  minify: false,
  sourceMaps: false,
  watch: false,
  hmr: false,
};

const bundler = new Bundler(entryFiles, options);

describe("jsx", () => {
  let html;

  beforeAll(async () => {
    const bundle = await bundler.bundle();
    const scriptSource = require("fs").readFileSync(bundle.name, {
      encoding: "utf8",
    });

    html = render(scriptSource);
  });
  it("should", () => {
    expect(prettier.format(html, { parser: "html" })).toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div id=\\"root\\">
            <div id=\\"1\\" ur-id=\\"0\\">First</div>
            <div id=\\"2\\" ur-id=\\"1\\">
              <div id=\\"3\\" ur-id=\\"0\\">Second 1st child</div>
              <div id=\\"4\\" ur-id=\\"1\\">Second 2nd child</div>
            </div>
            <div id=\\"5\\" ur-id=\\"2\\">Third</div>
          </div>
        </body>
      </html>
      "
    `);
  });
});
