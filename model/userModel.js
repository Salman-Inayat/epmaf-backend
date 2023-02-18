const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your First name"]
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your  Last name"]
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercasee: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    role: {
      type: String,
      enum: ["Customer", "Artist"],
      default: "Customer"
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false
    },
    confirmPassword: {
      type: String,
      required: [true, "Please provide a confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Paassword are not the same"
      }
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneNo: {
      type: String,
      required: [true, "Please provide your phone number"]
    },
    profilePicture: {
      type: String
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerifyToken: String,
    emailVerifyTokenExpires: Date
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JwtTimeStamp < changeTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function (email) {
  const resetToken = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: "10m"
  });

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.statics.createUser = async function (data) {
  const user = await this.create({ ...data });
  user.confirmPassword = undefined;
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.emailVerifyTokenExpires = Date.now() + 10 * 60 * 1000;

  user.save({ validateBeforeSave: false });
  user.resetToken = resetToken;
  return user;
};

userSchema.statics.recreateEmailVerification = async function (email) {
  const user = await this.findOne({
    email: email
  });
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.emailVerifyTokenExpires = Date.now() + 10 * 60 * 1000;

  user.save({ validateBeforeSave: false });
  user.resetToken = resetToken;
  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
