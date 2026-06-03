const normalizeCanonicalValue = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

const buildCanonicalString = (payload, fields) =>
  fields
    .map((field) => `${field}=${normalizeCanonicalValue(payload[field])}`)
    .join('&');

module.exports = {
  buildCanonicalString,
};
