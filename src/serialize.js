const fs = require("fs");
const { filterResults } = require("./filter");

const formatItem = (item, index, items) => {
  const isLast = items.length - 1 === index;
  return `${JSON.stringify(item)}${isLast === false ? "," : ""}\n`;
};

const formatResults = (outputFile, results) => {
  const formatted = filterResults(results).map(formatItem).join("");
  fs.writeFileSync(outputFile, `[\n${formatted}\n]`);
};

module.exports = { formatResults };
