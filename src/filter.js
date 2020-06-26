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

const filters = [
  industrialRemarks,
  noRoadRemarks,
  forLeaseRemarkes,
  noResidence,
  protected,
  boatAccess,
];

const filterResults = (results) => {
  console.log("before", results.length);

  const filtered = results
    .filter((result) => !filters.some((test) => test(result)))
    .sort((a, b) => a.Id.localeCompare(b.Id));

  console.log("after", filtered.length);

  return filtered;
};

module.exports = { filterResults };
