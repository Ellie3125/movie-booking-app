const mongoose = require("mongoose");

const USER_ROLE = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
};

const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
  DELETED: "deleted",
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [30, "Tên hiển thị tối đa 30 ký tự"],
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLE),
        message: "Vai trò không hợp lệ: {VALUE}",
      },
      default: USER_ROLE.USER,
      index: true,
    },
    authVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: "Trạng thái không hợp lệ: {VALUE}",
      },
      default: USER_STATUS.ACTIVE,
      index: true,
    },
    avatar: {
      type: String,
      default: "/uploads/avatars/avatar_01.png",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other", ""],
        message: "Giới tính không hợp lệ: {VALUE}",
      },
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Địa chỉ tối đa 200 ký tự"],
      default: "",
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Quốc gia tối đa 100 ký tự"],
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Tiểu sử tối đa 500 ký tự"],
      default: "",
    },
    notificationPreferences: {
      email: {
        bookingConfirmation: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true },
      },
      push: {
        bookingConfirmation: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        showReminders: { type: Boolean, default: true },
      },
    },
    preferences: {
      language: {
        type: String,
        enum: ["vi", "en"],
        default: "vi",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      timezone: {
        type: String,
        default: "Asia/Ho_Chi_Minh",
      },
      dateFormat: {
        type: String,
        enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
        default: "DD/MM/YYYY",
      },
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("User", UserSchema);
