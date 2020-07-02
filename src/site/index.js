const fetches = require("./fetch-index.json");

fetches.reverse();

const dayList = document.getElementById("days");

const summarizeChanges = (changeStats) => {
  return `+${changeStats.added.length}, -${changeStats.removed.length}, Δ${changeStats.changed.length}`;
};

const addItem = ({ date, changeStats }) => {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = date;
  link.innerText = `${date} (${summarizeChanges(changeStats)}`;
  li.appendChild(link);
  dayList.appendChild(li);
};

fetches.forEach((fetchInfo) => addItem(fetchInfo));
