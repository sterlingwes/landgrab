const fetches = require("./fetch-index.json");

fetches.reverse();

const dayList = document.getElementById("days");

const summarizeChanges = (changeStats) => {
  if (!changeStats) return;
  return `(+${changeStats.added.length}, -${changeStats.removed.length}, Δ${changeStats.changed.length})`;
};

const addItem = ({ date, changeStats }) => {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = date;
  const changes = summarizeChanges(changeStats);
  link.innerText = `${date} ${changes || ""}`;
  li.appendChild(link);
  dayList.appendChild(li);
};

fetches.forEach((fetchInfo) => addItem(fetchInfo));
