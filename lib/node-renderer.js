// const bundleFile = process.argv[2];

// if (!bundleFile) {
//   throw new Error("You must provide a path to the bundle file");
// }

// const fs = require("fs");
// const path = require("path");

const { Script } = require("vm");
const { JSDOM } = require("jsdom");

// const bundlePath = path.resolve("./", bundleFile);
// const bundleScript = fs.readFileSync(bundlePath, { encoding: "utf8" });

const render = (bundleScript) => {
  const script = new Script(bundleScript);

  const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    runScripts: "outside-only",
  });
  const vmContext = dom.getInternalVMContext();

  script.runInContext(vmContext);

  return dom.serialize();
};

module.exports = { render };
