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
  },
  { timestamps: true }
);

module.exports = model('Official', officialSchema);
