const index = require("./site/fetch-index.json");

const today = new Date();
let month = today.getMonth() + 1;
if (month < 10) {
  month = `0${month}`;
}
let day = today.getDate();
if (day < 10) {
  day = `0${day}`;
}
const date = `${today.getFullYear()}-${month}-${day}`;

const lastAdded = index.slice(0).pop();
if (lastAdded.date === date) {
  console.log(`overwriting existing date: ${date}`);
  index.pop();
}

const changeStats = require("../results-changes.json");

index.push({ date, changeStats });

const content = JSON.stringify(index, null, 2);
require("fs").writeFileSync("src/site/fetch-index.json", content);
