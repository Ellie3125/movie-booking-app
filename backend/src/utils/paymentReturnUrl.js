const BLOCKED_RETURN_URL_PROTOCOLS = new Set([
  'data:',
  'file:',
  'javascript:',
  'vbscript:',
]);

const normalizeReturnUrl = (value) => {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return '';
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new Error('Invalid payment return URL');
  }

  const protocol = parsedUrl.protocol.toLowerCase();

  if (!protocol || BLOCKED_RETURN_URL_PROTOCOLS.has(protocol)) {
    throw new Error(`Unsupported payment return URL protocol: ${parsedUrl.protocol}`);
  }

  return parsedUrl.toString();
};

const resolvePaymentReturnUrl = ({
  baseUrl,
  requestedReturnUrl,
  configuredReturnUrl,
}) => {
  const requestReturnUrl = normalizeReturnUrl(requestedReturnUrl);

  if (requestReturnUrl) {
    return requestReturnUrl;
  }

  const envReturnUrl = normalizeReturnUrl(configuredReturnUrl);

  if (envReturnUrl) {
    return envReturnUrl;
  }

  return `${String(baseUrl).replace(/\/$/, '')}/api/v1/payments/result`;
};

module.exports = {
  resolvePaymentReturnUrl,
};
