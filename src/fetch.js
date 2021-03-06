const fetch = require("isomorphic-fetch");
const { formatResults } = require("./serialize");
const {
  checkInternet,
  saveResult,
  persistResults,
} = require("./check-internet");

const outputFile = "results.json";

const queries = [
  // residential listings below $300k
  `ZoomLevel=7&LatitudeMax=45.53938&LongitudeMax=-74.37146&LatitudeMin=39.25175&LongitudeMin=-89.32385&Sort=1-A&PropertyTypeGroupID=1&PropertySearchTypeId=1&TransactionTypeId=2&PriceMin=25000&PriceMax=300000&LandSizeRange=1-0&Currency=CAD&RecordsPerPage=12&ApplicationId=1&CultureId=1&Version=7.0`,
  // vacant land listings below $100k
  `ZoomLevel=7&LatitudeMax=45.53938&LongitudeMax=-74.37146&LatitudeMin=39.25175&LongitudeMin=-89.32385&Sort=1-A&PropertyTypeGroupID=1&PropertySearchTypeId=6&TransactionTypeId=2&PriceMin=25000&PriceMax=100000&LandSizeRange=1-0&Currency=CAD&RecordsPerPage=12&ApplicationId=1&CultureId=1&Version=7.0`,
];

const fetchPage = (query, page) =>
  fetch("https://api2.realtor.ca/Listing.svc/PropertySearch_Post", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      cookie:
        "visid_incap_2269415=LI5A3iMqTmmj7vgWsxXvqLLY8V4AAAAAQUIPAAAAAAAEWEq7nBys8eWC6rPeCJlc; _ga=GA1.2.328239900.1592907958; _gid=GA1.2.1131805269.1592907958; gig_bootstrap_3_mrQiIl6ov44s2X3j6NGWVZ9SDDtplqV7WgdcyEpGYnYxl7ygDWPQHqQqtpSiUfko=gigya-pr_ver3; _fbp=fb.1.1592907958764.1902486790; visid_incap_2271082=6WDjY5BmR/an+zE0rsrzcbnY8V4AAAAAQUIPAAAAAABFG3Cs6VX7gAwVMy5WAKzB; nlbi_2269415=7Z2BTlqg9lHzQRumLTPy4AAAAACYy/098zDE6wcfnt9kSTky; incap_ses_304_2269415=xqJ2KcKc9CKFxRv5jwY4BFS08l4AAAAAa/S/X/uxawbsi777CgCYDg==; ASP.NET_SessionId=zxms5y3ao352upogym2zzlb5; nlbi_2271082=OSPdIEGhZxRl6im7UwrykgAAAABbqaQb/tRY4kTWQ+1mcQTB; incap_ses_304_2271082=D2YMc8SVw3s/XRz5jwY4BLG08l4AAAAAH/9Ll+XLFgJAXAnXY0E5Cw==; nlbi_2269415_2147483646=BH7WbJfUkDyLokUoLTPy4AAAAAC9/Ouz+Sgn+S6gHoRY5ZSB; reese84=3:MR24FGA0DAFL7ImeWIh+lQ==:tYDRgoScRXA6MYbdDEeIO6U6hctqL7IZfuQ32vW614GcHEAz11JlknTagzBlGFkivq53fR3bWn4T5XOe1fzHmC5WLWSCDRjQ534KgsM+HOhY08A6tMlxQzLpzqENg9puERdKuNxesRCZ606kPiPLoyA7SxTcJGw1WvqgDrAyLp0gfZSazEFPYHpyv77xkADWmrGICwGxh+tGEknPSAOWO0BaekcH2qNL2HexcKQPrikX0JbroWy49zImrCwiHNlz+uB/QtthmCcx+p5zn50I056zmHgcCp2CraaIhTQAIV6Ukb/8ea9BcrnuRqVtptRLscQPc2qhpbKLri5PcNnLsnx84GYRmH+v3eVqvhxQkdlYMUumm5iNmE+slVCFDOZAJSFU1JlGttMxzWaVU8QE4lK3CJTMV0ULFsfzM0+QWzE=:1hYqWb0qykVlgQtuWKkBQ4E5vZEyHxWmWj//vuPPX5E=; _4c_=jVRda9swFP0rRdC3KpEsfylvJYNRWNkY3XNRpOtYq2N5khyvK%2F3vu3KdBLYx6gdx79E590sXv5CphZ5seCEzWeaiEHklb8gTPAeyeSF6SOcxHaPvyIa0MQ5hs15P07TyoLro%2FEqrdTIphKgirDMuWcXqYs2zjH2nfgSqPQQNfaQH10d%2FvRXXtxIFR9t1QA%2FKW6B71xnoafgxKo%2BY7YDcEO0MYFIuV3LF0I%2B%2F0KNZnmzosSwyeIP2x9vHb3cf0BVZnQkpGVvNDbFKFjXeD96ZUcfH%2BDykeBPsroJ5wgsDR6vhcbImtilRWbML2oLdtzHBrJjhwaOToTXZ3rjpT9mCnmUyT7k%2FqX4%2Fqv3cR3Ldfg%2Fm6g5nThrVhdTmF%2B%2BOtteJ8rmPOA6H4NaNOKtnxLaqV0Yh9BWCxSFFqzrnt%2B5wAG%2B1Ss%2FiLzfI23k3BUjFblvvDnBVC0Qdvii5VxpNDw14PzPQCzbCHOP0nAuGS3CB6QwPaeYlGp3DxEmFy4Ns0NG6%2FsJG7MFb7NTfQ2ydwZsHr4xNrLlEk8gGGjV2MblpXrpTIVhtIDxFN5DXG%2FJzXkyB4y9lWRQCNyBiu3WZs%2FQhw1uzbCiRgiteKkU1yxnNea1pDbKiDQjOtKmaaleQU8yiYEwwXNByiZnhvrBT1OG4BC1P%2FEzKvESVKP6uYSl4af0%2F2upf2mah83fR%2B1O3l9m9pyF7lr1TcDwrQMjS6ErSChpO811dUdkISRu%2BM4XZNSYHTi61lyVL%2FxG%2BBOX1W8TX198%3D; _gali=SideBarPagination",
    },
    referrer: "https://www.realtor.ca/map",
    referrerPolicy: "no-referrer-when-downgrade",
    body: query + `&CurrentPage=${page}`,
    method: "POST",
    mode: "cors",
  });

const delay = 5000;

let results = [];
let currentPage = 0;
let totalPages = "unknown";

const finish = (exitCode) => {
  console.log(`Finished on page ${currentPage} of ${totalPages}`);
  if (exitCode === 0) {
    formatResults(outputFile, results);
  } else {
    console.log("not writing results.json with failed fetch run:", results);
  }
  process.exit(exitCode);
};

const wait = () => new Promise((resolve) => setTimeout(resolve, delay));

const filterByInternet = async (rawResults) => {
  return rawResults.reduce(async (chain, result) => {
    const { AddressText } = (result.Property || {}).Address || {};
    if (!AddressText) {
      return chain.then((chainResults) => [...chainResults, result]);
    }

    const internetTypes = await checkInternet(AddressText);
    if (internetTypes && internetTypes.length) {
      saveResult(AddressText, internetTypes);
      return chain.then((chainResults) => [...chainResults, result]);
    }

    return chain;
  }, Promise.resolve([]));
};

const addResults = (response) => {
  return response.json().then(async (json) => {
    const resultsWithInternet = await filterByInternet(json.Results);
    results = [...results, ...resultsWithInternet];
    totalPages = json.Paging.TotalPages;
  });
};

const nextPage = () => {
  currentPage += 1;
  console.log(`fetching page ${currentPage} of ${totalPages}`);
  return fetchPage(queries[0], currentPage)
    .then((response) => {
      if (!response.ok) {
        console.log(
          `Received ${response.status} ${response.headers.get("Content-Type")}`
        );
        finish(1);
      }

      return addResults(response);
    })
    .then(wait)
    .then(() => {
      if (currentPage < totalPages) {
        nextPage();
      } else {
        queries.shift();
        if (queries.length > 0) {
          currentPage = 0;
          return nextPage();
        } else {
          persistResults();
          finish(0);
        }
      }
    });
};

nextPage().catch((err) => {
  console.log("Failed to fetch");
  console.log(err);
  process.exit(1);
});
