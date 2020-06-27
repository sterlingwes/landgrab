const fetches = require("./fetch-index.json");

const dayList = document.getElementById("days");

const addItem = (date) => {
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = `${date}.html`;
  link.innerText = date;
  li.appendChild(link);
  dayList.appendChild(li);
};

fetches.forEach((fetch) => addItem(fetch.date));
