const ApiError = require('../utils/apiError');

const CREATE_SESSION_PATH = '/gateway/api/create-session';

const buildCreateSessionUrl = (gatewayBaseUrl) => {
  try {
    return new URL(CREATE_SESSION_PATH, gatewayBaseUrl).toString();
  } catch {
    throw ApiError.internal(
      'PAYMENT_GATEWAY_BASE_URL is invalid',
      'PAYMENT_GATEWAY_BASE_URL_INVALID'
    );
  }
};

const parseGatewayResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const createGatewayFailure = (message, details = null) =>
  new ApiError(
    502,
    message || 'Payment gateway create-session request failed',
    'PAYMENT_GATEWAY_CREATE_SESSION_FAILED',
    details
  );

const createGatewayPaymentSession = async ({
  gatewayBaseUrl,
  payload,
  fetchImpl = globalThis.fetch,
}) => {
  if (!fetchImpl) {
    throw ApiError.internal(
      'fetch is not available for payment gateway requests',
      'PAYMENT_GATEWAY_FETCH_NOT_AVAILABLE'
    );
  }

  const createSessionUrl = buildCreateSessionUrl(gatewayBaseUrl);
  let response;

  try {
    response = await fetchImpl(createSessionUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw createGatewayFailure(error.message);
  }

  const body = await parseGatewayResponse(response);

  if (!response.ok || body?.success !== true) {
    throw createGatewayFailure(
      body?.message,
      {
        statusCode: response.status,
        code: body?.code || null,
        data: body?.data || null,
      }
    );
  }

  if (!body.data?.paymentUrl) {
    throw createGatewayFailure(
      'Payment gateway response is missing paymentUrl',
      { statusCode: response.status, data: body?.data || null }
    );
  }

  return body.data;
};

module.exports = {
  createGatewayPaymentSession,
};
