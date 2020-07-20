const fs = require("fs");
const fetch = require("isomorphic-fetch");
const htmlMiner = require("html-miner");

const baseUrl = "https://www.ic.gc.ca/app/sitt/bbmap/geoSearch.html?address=";

const encodeAddress = (address) =>
  encodeURIComponent(address).replace(/%(20|0A)/g, "+");

const detailPagePath = (result) => {
  const [id] = result.split(",");
  return `https://www.ic.gc.ca/app/sitt/bbmap/${id}/service.html?lang=eng`;
};

const excludableInternetTypes = [
  "Fixed Wireless",
  "DSL",
  "Mobile Wireless",
  "Satellite",
  "High Capacity Transport Services",
];

const fetchDetail = (url) =>
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        console.log("failed to fetch detail page", response.status, url);
      } else {
        return response.text().then((html) =>
          htmlMiner(html, {
            _each_: "tbody tr td span",
          })
        );
      }
    })
    .then((result) => {
      if (!result || !result._each_) return;
      return result._each_.filter(
        (internetType) =>
          excludableInternetTypes.includes(internetType) === false
      );
    });

const checkInternet = (address) =>
  fetch(`${baseUrl}${encodeAddress(address)}`)
    .then((response) => {
      if (!response.ok) {
        console.log("failed to fetch search results", response.status, address);
      } else {
        return response.text().then((html) =>
          htmlMiner(html, {
            _each_: ".content li a",
          })
        );
      }
    })
    .then((result) => {
      if (!result) return;

      let firstLinkText;
      if (typeof result._each_ === "string") {
        firstLinkText = result._each_;
      } else if (result._each_) {
        firstLinkText = result._each_[0];
      }

      if (!firstLinkText) {
        console.log("no first link :(", result);
        return;
      }

      return fetchDetail(detailPagePath(firstLinkText));
    });

let results = {};
let existingResults = {};

try {
  existingResults = require("./internet-tracking.json");
} catch (e) {}

const saveResult = (address, internetTypes) => {
  results[address] = internetTypes;
};

const persistResults = () => {
  const merged = { ...existingResults, ...results };
  fs.writeFileSync(
    "src/internet-tracking.json",
    JSON.stringify(merged, null, 2)
  );
};

module.exports = { checkInternet, saveResult, persistResults };
