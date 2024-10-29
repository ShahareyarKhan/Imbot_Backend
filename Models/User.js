const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bots: [
    {
      botName: {
        type: String,
        required: true,
      },
      botText: {
        type: String,
        required: true,
      },
    },
  ],
  resetPasswordOTP: {
    type: String,
    expiresIn: "2m",
    default: null,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
