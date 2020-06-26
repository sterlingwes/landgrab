const { formatResults } = require("./serialize");

const filename = process.argv.slice(0).pop();
const file = require(filename);

if (!filename || !file)
  throw new Error("Please specify a JSON file to apply the filter on");

formatResults("test-reformat.json", file);
