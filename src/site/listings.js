const { createElement } = require("../../lib/jsx-without-react");
const listings = require("./augmented-listings.json");

const mount = (rootElement) => {
  const container = document.body;
  container.appendChild(rootElement);
};

const currencyFormatter = Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});
const formatCurrency = (value) => currencyFormatter.format(value);

const Header = ({ children }) => (
  <h2 style={{ margin: 0, marginBottom: 5, padding: 0 }}>{children}</h2>
);

const SubHeader = ({ children }) => (
  <h3 style={{ margin: 0, marginBottom: 10, padding: 0 }}>{children}</h3>
);

const layoutStyle = {
  display: "flex",
  flexDirection: "row",
};

const SplitLayout = ({ children }) => (
  <div className="split-layout" style={layoutStyle}>
    {children}
  </div>
);

const Price = ({ price, ppa, acreage }) => {
  let acreageStats;
  if (ppa) {
    const ppaRound = formatCurrency(Math.round(ppa * 100) / 100);
    const acres = Math.round(acreage * 10) / 10;
    acreageStats = `(${acres}ac, ${ppaRound} per acre)`;
  }

  return (
    <div>
      <span>{price}</span>
      {!!acreageStats && <span>{acreageStats}</span>}
    </div>
  );
};

const CloseCities = ({ distances }) => {
  const closeCities = Object.entries(distances);
  const cities = closeCities.sort((a, b) => a[1] - b[1]).slice(0, 3);

  return (
    <ul>
      {cities.map((city) => {
        const cityDistance = Math.round(city[1] * 100) / 100;
        return <li>{`${city[0]} (${cityDistance}kms)`}</li>;
      })}
    </ul>
  );
};

const Description = ({ children }) => (
  <div>
    {typeof children === "string" ? children.replace("***", "") : children}
  </div>
);

const Images = ({ images }) => (
  <div>
    {!!images[0] && (
      <img
        data-src={images[0].LowResPath}
        style="width: 256px; height: 200px;"
      />
    )}
  </div>
);

const Card = ({ className, children }) => (
  <div
    className={`listing ${className}`}
    style={{
      position: "relative",
      margin: 20,
      padding: 20,
      borderRadius: 5,
      backgroundColor: "#fff",
      boxShadow: "2px 2px 2px #eee",
    }}
  >
    {children}
  </div>
);

const ListingId = ({ children }) => (
  <div
    style={{
      position: "absolute",
      top: 10,
      right: 10,
      fontSize: 12,
      color: "#ccc",
    }}
  >
    {children}
  </div>
);

const Listing = ({
  Property: {
    Address: { AddressText, Latitude: lat, Longitude: lon },
    Photo,
    Price: price,
  },
  Description: description,
  Distances: distances,
  Acreage: acreage,
  id,
  ...rest
}) => {
  const ppa = rest["Price per acre"];
  const detailUrl = rest["Detail URL"];
  const [address, location] = AddressText.split("|");

  return (
    <Card>
      <Header>{address}</Header>
      {!!location && <SubHeader>{location}</SubHeader>}
      <SplitLayout>
        {!!Photo && <Images images={Photo} />}
        <div style={{ marginLeft: 20 }}>
          <Price price={price} ppa={ppa} acreage={acreage} />
          <CloseCities distances={distances} />
          <Description>{description}</Description>
          <div style={{ paddingTop: 10 }}>
            <a href={detailUrl} style={{ marginRight: 10 }} target="_blank">
              Listing Detail
            </a>
            <a
              href={`https://www.google.ca/maps/@${lat},${lon},16z/data=!5m1!1e4`}
              target="_blank"
            >
              Google Maps
            </a>
          </div>
        </div>
      </SplitLayout>
      <ListingId>{id}</ListingId>
    </Card>
  );
};

const ScrollButtons = () => (
  <div style={{ position: "fixed", bottom: 10, right: 10 }}>
    <div
      className="scroll-btn scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ⬆️ Top
    </div>
  </div>
);

const container = (
  <div>
    {listings.map((listing) => (
      <Listing {...listing} />
    ))}
    <ScrollButtons />
  </div>
);

mount(container);

const debounce = (func, wait = 50, immediate = true) => {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const containerNotHidden = (img) => {
  const container = img.parentNode.parentNode.parentNode;
  if (!container) return true;

  if (container.classList.contains("filtered")) {
    return false;
  }

  return true;
};

const eagerDistance = 200;
const lazyLoad = () => {
  console.log("lazyLoading images");
  document.querySelectorAll("img").forEach((img, i) => {
    const threshold = window.innerHeight + window.pageYOffset + eagerDistance;
    const shouldLoad = img.offsetParent.offsetTop < threshold;
    if (containerNotHidden(img) && !img.src && shouldLoad) {
      img.src = img.dataset.src;
    }
  });
};

window.addEventListener("scroll", debounce(lazyLoad));
window.addEventListener("resize", debounce(lazyLoad));
