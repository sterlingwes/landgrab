const industrialRemarks = (result) => /industrial/i.test(result.PublicRemarks);
const noRoadRemarks = (result) =>
  /no road/i.test(result.PublicRemarks) ||
  /land locked/.test(result.PublicRemarks);
const forLeaseRemarkes = (result) => /for lease/i.test(result.PublicRemarks);
const noResidence = (result) =>
  result.PublicRemarks.includes("unable to accommodate a residence");
const protected = (result) => /ep1/i.test(result.PublicRemarks);
const boatAccess = (result) =>
  /boat/i.test(result.Land.AccessType) ||
  /accessible by short boat ride/i.test(result.PublicRemarks) ||
  /within minutes of the ferry/i.test(result.PublicRemarks);
const timeShare = (result) => /per year/i.test(result.PublicRemarks);
const fractional = (result) => /fractional/i.test(result.PublicRemarks);

const filters = [
  industrialRemarks,
  noRoadRemarks,
  forLeaseRemarkes,
  noResidence,
  protected,
  boatAccess,
  timeShare,
  fractional,
];

const filterResults = (results) => {
  console.log("before", results.length);

  const ids = [];

  const filtered = results
    .filter((result) => {
      if (ids.includes(result.Id)) return false;
      ids.push(result.Id);
      return !filters.some((test) => test(result));
    })
    .sort((a, b) => a.Id.localeCompare(b.Id));

  console.log("after", filtered.length);

  return filtered;
};

module.exports = { filterResults };
