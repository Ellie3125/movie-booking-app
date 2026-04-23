const { URL } = require('url');

const getRequestBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const appendQueryParams = (baseUrl, params) => {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

module.exports = {
  getRequestBaseUrl,
  appendQueryParams,
};
