const dateFormat = require("dateformat");

const DATE_FORMAT = "yyyy-mm-dd";

function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return dateFormat(value, DATE_FORMAT);
  }
  if (value instanceof Array) {
    return `[${value.join(", ")}]`;
  }
  return String(value);
}

function insertVariables({ template, variables }) {
  let content = template;
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(`{{ ${key} }}`, clean(value));
  });
  return content;
}

module.exports = { insertVariables };
