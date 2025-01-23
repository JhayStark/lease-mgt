const { Schema, model } = require('mongoose');

const ownerShipMember = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerShipId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'OwnerShipBody',
    },
    role: {
      type: String,
      required: true,
      enum: [
        'Head',
        'Family member',
        'Associate',
        'Co-owner',
        'Manager',
        'Owner',
      ],
    },
  },
  { timestamps: true }
);

ownerShipMember.index({ userId: 1, ownerShipId: 1 }, { unique: true });

module.exports = model('OwnerShipMember', ownerShipMember);
