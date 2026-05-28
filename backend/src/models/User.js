const mongoose = require("mongoose");

const USER_ROLE = {
  USER: "user",
  ADMIN: "admin",
};

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
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
    phoneNumber: {
      type: String,
      trim: true,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
      default: null,
    },
    passwordHash: {
      type: String,
      required: [true, "Mật khẩu đã hash là bắt buộc"],
      select: false,
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const hidePrivateFields = (_doc, ret) => {
  ret.id = String(ret._id);
  delete ret._id;
  delete ret.passwordHash;
  delete ret.__v;
  return ret;
};

UserSchema.set("toJSON", {
  virtuals: false,
  transform: hidePrivateFields,
});

UserSchema.set("toObject", {
  virtuals: false,
  transform(_doc, ret) {
    return hidePrivateFields(_doc, ret);
  },
});

module.exports = mongoose.model("User", UserSchema);
