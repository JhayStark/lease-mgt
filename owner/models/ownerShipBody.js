const { Schema, model } = require('mongoose');

const ownerShipBodySchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Family', 'State', 'Organization', 'Individual'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    head: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'User',
    },
    ownerShipId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    search: {
      type: String,
    },
  },
  { timestamps: true }
);

ownerShipBodySchema.index({ ownerShipId: 1, head: 1 }, { unique: true });

module.exports = model('OwnerShipBody', ownerShipBodySchema);
