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
const island = (r) => /Howe Island/i.test(r.PublicRemarks);
const fixedWeek = (r) => /fixed week/i.test(r.PublicRemarks);
const gEstates = (r) => /Gibraltar Estates/i.test(r.PublicRemarks);
const bEstates = (r) => /Brecken Ridge Estates/i.test(r.PublicRemarks);
const contractor = (r) => /contractor/i.test(r.PublicRemarks);
const noHydro = (r) => /no hydro/i.test(r.PublicRemarks);
const specificRegex = new RegExp('(' + [
  22084675, // Seguin trees
  22294537, // marmora subdivision trees angle
  21731796, // marmora trees
  41930662, // Howe Island
  21925098, // Seguin next to commercial
].join('|') + ')', 'i');
const specific = (r) => specificRegex.test(r.PublicRemarks);

const filters = [
  industrialRemarks,
  noRoadRemarks,
  forLeaseRemarkes,
  noResidence,
  protected,
  boatAccess,
  timeShare,
  fractional,
  island,
  fixedWeek,
  gEstates,
  bEstates,
  contractor,
  noHydro,
  specific
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
