require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  bookingHoldTtlMinutes: Number(process.env.BOOKING_HOLD_TTL_MINUTES || 5),
  paymentHmacSecret: process.env.PAYMENT_HMAC_SECRET,
  paymentCurrency: process.env.PAYMENT_CURRENCY || 'VND',
  paymentSignatureTtlSeconds: Number(
    process.env.PAYMENT_SIGNATURE_TTL_SECONDS || 900
  ),
  nodeEnv: process.env.NODE_ENV || 'development'
};
