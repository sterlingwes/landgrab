const { formatResults } = require("./serialize");

const filename = process.argv.slice(0).pop();
const file = require(filename);

formatResults("test-reformat.json", file);
