const { Schema, model } = require('mongoose');

const officialSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    staffId: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },
    permissions: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

officialSchema.index({ staffId: 1 }, { unique: true });
module.exports = model('Official', officialSchema);
