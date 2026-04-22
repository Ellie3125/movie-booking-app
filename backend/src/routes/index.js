const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ─── User ─────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  phone:         { type: String },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
  address: { city: String, district: String },
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, parseInt(process.env.BCRYPT_ROUNDS) || 10);
  next();
});
userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.passwordHash); };
userSchema.methods.toSafeObject = function () { const o = this.toObject(); delete o.passwordHash; return o; };

// ─── Movie ────────────────────────────────────────────────────────────────────
const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true, index: true },
  description: String,
  duration:    { type: Number, required: true },
  genres:      [String],
  cast:        [String],
  director:    String,
  ageRating:   { type: String, enum: ['P', 'C13', 'C16', 'C18'], default: 'P' },
  language:    { type: String, default: 'vi' },
  posterUrl:   String,
  trailerUrl:  String,
  rating:      { type: Number, default: 0, min: 0, max: 10 },
  releaseDate: Date,
  endDate:     Date,
  status:      { type: String, enum: ['coming_soon', 'now_showing', 'ended'], default: 'coming_soon', index: true },
}, { timestamps: true });

// ─── Cinema ───────────────────────────────────────────────────────────────────
const cinemaSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  city:      { type: String, required: true, index: true },
  address:   String,
  location:  {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  phone:     String,
  email:     String,
  amenities: [String],
  openTime:  { type: String, default: '08:00' },
  closeTime: { type: String, default: '23:00' },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });
cinemaSchema.index({ location: '2dsphere' });

// ─── Room ─────────────────────────────────────────────────────────────────────
const seatSchema = new mongoose.Schema({
  row: String, number: Number,
  type: { type: String, enum: ['standard', 'vip', 'couple'], default: 'standard' },
  position: [Number],
}, { _id: false });

const roomSchema = new mongoose.Schema({
  cinemaId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
  name:       { type: String, required: true },
  screenType: { type: String, enum: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'], default: '2D' },
  totalSeats: Number,
  rows:       Number,
  cols:       Number,
  seatLayout: [seatSchema],
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// ─── Showtime ─────────────────────────────────────────────────────────────────
const showtimeSchema = new mongoose.Schema({
  movieId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Movie',  required: true },
  roomId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room',   required: true },
  cinemaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true, index: true },
  startTime: { type: Date, required: true },
  endTime:   { type: Date, required: true },
  language:  { type: String, default: 'vi' },
  format:    { type: String, enum: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'], default: '2D' },
  pricing: {
    standard: { type: Number, default: 90000 },
    vip:      { type: Number, default: 130000 },
    couple:   { type: Number, default: 200000 },
  },
  seatAvailability: { type: Map, of: String },
  status: { type: String, enum: ['open', 'sold_out', 'cancelled'], default: 'open', index: true },
}, { timestamps: true });
showtimeSchema.index({ movieId: 1, startTime: 1 });
showtimeSchema.index({ roomId:  1, startTime: 1 });
showtimeSchema.index({ cinemaId:1, startTime: 1 });

// ─── Booking ──────────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  showtimeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{
    seatKey: String, row: String, number: Number,
    type: String, price: Number, _id: false,
  }],
  totalAmount:    Number,
  discountAmount: { type: Number, default: 0 },
  finalAmount:    Number,
  promoCode:      String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], default: 'pending' },
  qrCode:       String,
  bookedAt:     { type: Date, default: Date.now },
  expiresAt:    { type: Date, index: { expireAfterSeconds: 0 } },
  cancelledAt:  Date,
  cancelReason: String,
}, { timestamps: true });
bookingSchema.index({ userId: 1, bookedAt: -1 });
bookingSchema.index({ showtimeId: 1, status: 1 });

// ─── Payment ──────────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  amount:        { type: Number, required: true },
  method:        { type: String, enum: ['momo', 'vnpay', 'zalopay', 'visa', 'mastercard', 'cash'], required: true },
  transactionId: String,
  gatewayRef:    String,
  status:        { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  metadata:      { type: mongoose.Schema.Types.Mixed },
  paidAt:        Date,
  refundedAt:    Date,
  refundAmount:  Number,
}, { timestamps: true });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });

// ─── Ticket ───────────────────────────────────────────────────────────────────
// 1 booking N ghế → N Ticket documents (1 ticket = 1 ghế cụ thể)
const ticketSchema = new mongoose.Schema({
  bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',  required: true },
  paymentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Payment',  required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  movieId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Movie',    required: true },
  cinemaId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema',   required: true },
  roomId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room',     required: true },

  // Snapshot denormalized — dùng khi in vé, không cần join
  snapshot: {
    movieTitle: String,
    cinemaName: String,
    cinemaAddress: String,
    roomName:   String,
    screenType: String,
    startTime:  Date,
    endTime:    Date,
    language:   String,
    format:     String,
  },

  seatKey:  { type: String, required: true },
  seatRow:  String,
  seatNum:  Number,
  seatType: { type: String, enum: ['standard', 'vip', 'couple'] },
  price:    Number,

  ticketCode: { type: String, required: true, unique: true },
  qrData:     String,   // base64 QR PNG

  status:   { type: String, enum: ['active', 'used', 'cancelled'], default: 'active' },
  usedAt:   Date,
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });
ticketSchema.index({ bookingId: 1 });
ticketSchema.index({ userId:    1, issuedAt: -1 });
ticketSchema.index({ ticketCode: 1 }, { unique: true });
ticketSchema.index({ showtimeId: 1, seatKey: 1 });

// ─── Review ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating:  { type: Number, required: true, min: 1, max: 10 },
  comment: String,
  likes:   { type: Number, default: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });
reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  User:     mongoose.model('User',     userSchema),
  Movie:    mongoose.model('Movie',    movieSchema),
  Cinema:   mongoose.model('Cinema',   cinemaSchema),
  Room:     mongoose.model('Room',     roomSchema),
  Showtime: mongoose.model('Showtime', showtimeSchema),
  Booking:  mongoose.model('Booking',  bookingSchema),
  Payment:  mongoose.model('Payment',  paymentSchema),
  Ticket:   mongoose.model('Ticket',   ticketSchema),
  Review:   mongoose.model('Review',   reviewSchema),
};