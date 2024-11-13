const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    idType: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    // password: { type: String, required: true },
    name: { type: String, required: true },
    otp: { type: String },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
