const mongoose = require("mongoose");

const USER_ROLE = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
};

const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
};

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
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
      default: "/avatars/avatar_01.png",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("User", UserSchema);
