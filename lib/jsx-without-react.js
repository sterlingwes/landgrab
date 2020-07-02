/* https://medium.com/variant-as/using-jsx-for-your-own-lightweight-declarative-ui-library-a773d3796475 */

const isEvent = (k, v) => k.startsWith("on") && typeof v === "function";
const eventName = (k) => k.substr(2).toLowerCase();
const isString = (s) => typeof s === "string";
const isFunction = (s) => typeof s === "function";

const decamelize = (str) =>
  str.replace(
    /([a-z][A-Z])/g,
    (match) => `${match[0]}-${match[1].toLowerCase()}`
  );

const pixelShorthandExcluded = (key) =>
  ["opacity"].every((cssKey) => key.includes(cssKey) === false);

const postfixValue = (key, val) =>
  typeof val === "number" && pixelShorthandExcluded(key) !== false
    ? `${val}px`
    : val;

const styleObjToStyleString = (styleObj) =>
  Object.entries(styleObj)
    .map(([key, val]) => `${decamelize(key)}:${postfixValue(key, val)}`)
    .join(";");

const attrs = (el, props) => {
  // Remember, JSX sets props to `null` if nothing is defined, so in that case we just return el
  if (!props) {
    return el;
  }

  // For every passed prop, we get key and value
  for (let [k, val] of Object.entries(props)) {
    if (typeof val === "undefined") {
      continue;
    }

    if (isEvent(k, val)) {
      el.addEventListener(eventName(k), val);
      continue;
    }

    if (k === "className" && typeof val === "string" && /\s+/.test(val)) {
      el.className = val;
      continue;
    }

    if (k === "className") {
      const classes = Array.isArray(val) ? val : [val];
      el.classList.add(...classes);
      continue;
    }

    if (k === "style" && typeof val === "object") {
      el.setAttribute(k, styleObjToStyleString(val));
      continue;
    }

    el.setAttribute(k, val);
  }
  return el;
};

const validNode = (node) => node instanceof HTMLElement || node instanceof Text;

const createElement = (tag, props, ...children) => {
  if (isFunction(tag)) {
    return tag({ ...props, children });
  }
  const el = attrs(document.createElement(tag), props);
  children.flat().forEach((child) => {
    const node = !isString(child) ? child : document.createTextNode(child);
    if (node === false) return;
    if (!validNode(node)) {
      throw new Error(`${typeof node} is not an HTMLElement`);
    }
    el.appendChild(node);
  });
  return el;
};

module.exports = { createElement };
