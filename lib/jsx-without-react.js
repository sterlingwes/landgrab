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

const runtimeAttribute = (attributeKey) => isEvent(attributeKey);

const applyRuntimeAttributes = (el, props) => {
  if (!props) {
    return el;
  }

  for (let [k, val] of Object.entries(props)) {
    if (typeof val === "undefined" || !runtimeAttribute(k)) {
      continue;
    }

    el.addEventListener(eventName(k), val);
  }
  return el;
};

const applyBuildAttributes = (el, props) => {
  if (!props) {
    return el;
  }

  for (let [k, val] of Object.entries(props)) {
    if (typeof val === "undefined" || runtimeAttribute(k)) {
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

const getSiblingPosition = (node) =>
  Array.prototype.indexOf.call(node.parentElement.children, node);

const addNodeId = (node) => {
  if (!node) {
    return;
  }
  const positions = [getSiblingPosition(node)];
  let currentNode = node.parentElement;
  while (currentNode && currentNode !== document.body) {
    if (currentNode && currentNode.parentElement) {
      positions.unshift(getSiblingPosition(currentNode));
    }
    currentNode = currentNode.parentElement;
  }

  const tag = positions.join("-");
  node.setAttribute("ur-id", tag);
};

const createElement = (tag, props, ...children) => {
  if (isFunction(tag)) {
    return tag({ ...props, children });
  }
  const el = applyBuildAttributes(document.createElement(tag), props);
  children.flat().forEach((child) => {
    const node = !isString(child) ? child : document.createTextNode(child);
    if (node === false) return;
    if (!validNode(node)) {
      throw new Error(`${typeof node} is not an HTMLElement`);
    }
    el.appendChild(node);
    if (node instanceof Text === false) {
      addNodeId(node);
    }
  });
  return el;
};

module.exports = { createElement };
