const listings = require("./augmented-listings.json");

const addItem = (listingDiv) => {
  const container = document.getElementById("listings");
  container.appendChild(listingDiv);
};

const el = (elementName) => document.createElement(elementName);

const currencyFormatter = Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});
const formatCurrency = (value) => currencyFormatter.format(value);

const createListingDiv = (listing) => {
  const div = el("div");
  div.className = "listing";
  const imageContainer = el("div");
  imageContainer.className = "listing-images";
  const header = el("div");
  header.className = "listing-header";

  if (listing.Property.Photo) {
    listing.Property.Photo.forEach((photo) => {
      const img = el("img");
      img.src = photo.MedResPath || photo.LowResPath || photo.HighResPath;
      imageContainer.appendChild(img);
    });
  }

  const h2 = el("h2");
  h2.innerText = listing.Property.Address.AddressText;

  const price = el("span");
  price.className = "listing-price";
  price.innerText = listing.Property.Price;

  const acres = el("span");
  acres.className = "listing-acres";
  acres.innerText = listing.Acreage;

  const distances = el("ul");
  const closeCities = Object.entries(listing.Distances);
  if (closeCities.length) {
    const cities = closeCities.sort((a, b) => a[1] - b[1]).slice(0, 3);
    cities.forEach((city) => {
      const item = el("li");
      const cityDistance = Math.round(city[1] * 100) / 100;
      item.innerText = `${city[0]} (${cityDistance}kms)`;
      distances.appendChild(item);
    });
  }

  const ppa = listing["Price per acre"];
  if (ppa) {
    const ppaRound = formatCurrency(Math.round(ppa * 100) / 100);
    price.innerText += ` (${ppaRound} per acre)`;
  }

  header.appendChild(h2);
  header.appendChild(price);
  header.appendChild(distances);

  const description = el("p");
  description.className = "listing-description";
  description.innerText = listing.Description;

  const detailLink = el("a");
  detailLink.href = listing["Detail URL"];
  detailLink.innerText = "View Listing";

  div.appendChild(imageContainer);
  div.appendChild(header);
  div.appendChild(description);

  return div;
};

listings.forEach((listing) => addItem(createListingDiv(listing)));
