const { getDistance } = require("geolib");
const file = "./results-20200625.json";
const results = require(file);

const coords = {
  Toronto: {
    lat: 43.674613,
    lon: -79.36119,
  },
  Kawartha: {
    lat: 44.534,
    lon: -78.900671,
  },
  Kingston: {
    lat: 44.257767,
    lon: -76.497875,
  },
  Kitchener: {
    lat: 43.459596,
    lon: -80.504999,
  },
  Windsor: {
    lat: 42.307026,
    lon: -83.039759,
  },
  Niagara: {
    lat: 43.081581,
    lon: -79.083362,
  },
};

const landmarks = Object.keys(coords);

const getDistances = (resultLocation) =>
  landmarks.reduce(
    (distances, city) => ({
      ...distances,
      [city]: getDistance(coords[city], resultLocation) / 1000,
    }),
    {}
  );

const acreInFt2 = 43560;

const parseAcreage = (result) => {
  if (!result.Land || !result.Land.SizeTotal) return -1;
  const [size] = result.Land.SizeTotal.split("|");

  if (size === "under 1/2 acre") {
    return 0.2;
  }

  if (size === "1/2 - 1 acre") {
    return (0.5 + 1) / 2;
  }

  if (size === "1/2 - 1.99 acres") {
    return (0.5 + 2) / 2;
  }

  if (size === "2 - 4.99 acres") {
    return (2 + 5) / 2;
  }

  if (/[0-9.]+ ac(res?)?/i.test(size)) {
    return parseFloat(size) || -1;
  }

  const ftDims = size.match(/([0-9.']+)\s?f?t?\s+x\s+([0-9.']+)\s?f?t?/i);
  if (ftDims) {
    const left = parseFloat(ftDims[1]);
    const right = parseFloat(ftDims[2]);
    return (left * right) / acreInFt2;
  }

  const acreRange = size.match(/[0-9]+ - [0-9]+ acres/);
  if (acreRange) {
    const left = parseInt(acreRange[1]);
    const right = parseInt(acreRange[2]);
    return (left + right) / 2;
  }

  const oneDim = size.match(/([0-9.']+)\s?ft/i);
  if (oneDim) {
    const dim = parseInt(oneDim[1]);
    return (dim * dim) / acreInFt2;
  }

  console.log(size);

  return -1;
};

const parsePrice = (result) => {
  if (!result.Property.Price) return -1;
  return parseFloat(result.Property.Price.replace(/[^0-9]/g, ""));
};

const parseLocation = (result) => {
  let lat;
  let lon;
  if (result.Property.Address) {
    lat = parseFloat(result.Property.Address.Latitude);
    lon = parseFloat(result.Property.Address.Longitude);
  }

  if (lat && lon) {
    return { lat, lon };
  }
};

const ppa = "Price per acre";
const ppf = "Price per sq ft";

const shrinkResult = (result) => {
  const Price = parsePrice(result);
  const Acreage = parseAcreage(result);
  const SqFt = 43560 * Acreage;
  const canConvert = Price > 0 && Acreage > 0;

  const location = parseLocation(result);
  const distances = location ? getDistances(location) : null;

  return {
    id: result.Id,
    "MLS Number": result.MlsNumber,
    Description: result.PublicRemarks,
    Building: result.Building,
    Property: result.Property,
    Land: result.Land,
    Price,
    Acreage,
    [ppa]: canConvert ? Price / Acreage : null,
    [ppf]: canConvert ? Price / SqFt : null,
    Distances: distances,
    Postal: result.PostalCode,
    "Detail URL": `https://realtor.ca${result.RelativeDetailsURL}`,
  };
};

const slimResults = filtered.map(shrinkResult).sort((a, b) => {
  if (!a[ppa] && !b[ppa]) return 0;
  if (!a[ppa]) return 1;
  if (!b[ppa]) return 1;
  return a[ppa] - b[ppa];
});

require("fs").writeFileSync(`${file}-slim`, JSON.stringify(slimResults));

// ====
// range stats follow
// ====

// const weirdPrice = (result) => {
//   const stripped = result.Property.Price.replace(/[^$0-9,]/g, "");
//   return stripped.length !== result.Property.Price.length;
// };

// const priceRanges = {
//   10: 0,
//   20: 0,
//   30: 0,
//   40: 0,
//   50: 0,
//   60: 0,
//   70: 0,
//   80: 0,
//   90: 0,
//   100: 0,
// };

// const rangeKeys = Object.keys(priceRanges)
//   .map((key) => parseInt(key))
//   .sort((a, b) => a - b);

// const incrementPriceRange = (rangeCounts, result) => {
//   if (!result.Price) {
//     rangeCounts.na += 1;
//     return;
//   }

//   let keys = rangeKeys.slice(0);
//   let nearestThousand;
//   while (!nearestThousand && keys.length) {
//     const nextKey = keys.pop();
//     const divisor = nextKey * 1000;
//     const divided = result.Price / divisor;
//     if (divided >= 1) {
//       nearestThousand = nextKey;
//     }
//   }

//   rangeCounts[nearestThousand] += 1;
// };

// const counts = slimResults.reduce(
//   (counts, result) => {
//     if (result.Acreage < 0) counts.notInAcres += 1;
//     if (weirdPrice(result)) counts.weirdPrice += 1;
//     incrementPriceRange(counts.priceRanges, result);
//     return counts;
//   },
//   {
//     notInAcres: 0,
//     weirdPrice: 0,
//     priceRanges: { ...priceRanges, na: 0 },
//   }
// );

// console.log(counts);
