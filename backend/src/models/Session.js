const mongoose = require('mongoose');

const SESSION_REVOKE_REASON = {
  LOGOUT: 'logout',
  LOGOUT_ALL: 'logout_all',
  ROTATED: 'rotated',
  PASSWORD_CHANGED: 'password_changed',
  SECURITY: 'security',
};

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },
    ip: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedReason: {
      type: String,
      enum: Object.values(SESSION_REVOKE_REASON),
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1, isRevoked: 1, expiresAt: 1 });

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
module.exports.SESSION_REVOKE_REASON = SESSION_REVOKE_REASON;
