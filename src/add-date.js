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
index.push({ date });

const content = JSON.stringify(index, null, 2);
require("fs").writeFileSync("src/site/fetch-index.json", content);
