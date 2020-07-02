const fs = require("fs");

const diff = fs.readFileSync("results-change-diff", { encoding: "utf-8" });
const diffLines = diff
  .split(/\n/g)
  .filter((diffLine) => /^[+-]\{"Id/.test(diffLine));

const changeType = (diff) => {
  if (diff.indexOf("+") === 0) return "added";
  if (diff.indexOf("-") === 0) return "removed";
  return "unknown";
};

const parseId = (diff) => {
  const [, id] = diff.match(/\{"Id":"([0-9]+)"/) || [];
  return id;
};

const changeStats = diffLines.reduce(
  (acc, diff) => {
    const type = changeType(diff);
    const id = parseId(diff);

    if (type === "added") {
      if (acc.removed.includes(id)) {
        return {
          ...acc,
          removed: acc.removed.filter((rmId) => rmId !== id),
          changed: acc.changed.concat(id),
        };
      }

      return {
        ...acc,
        added: acc.added.concat(id),
      };
    }

    if (type === "removed") {
      return {
        ...acc,
        removed: acc.removed.concat(id),
      };
    }

    return acc;
  },
  { added: [], changed: [], removed: [] }
);

fs.writeFileSync("results-changes.json", JSON.stringify(changeStats));
