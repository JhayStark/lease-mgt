const { Schema, model } = require('mongoose');

const leaseSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    lessee: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'OwnerShipBody',
    },
    beneficialOwner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    documents: {
      type: Object,
    },
    groundRent: {
      type: Number,
      required: true,
    },
    lessor: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'OwnerShipBody',
    },
    actingLessee: {
      type: Object,
    },
    actingLessor: {
      type: Object,
    },
  },
  { timestamps: true }
);

leaseSchema.index({ propertyId: 1, startDate: 1 }, { unique: true });

module.exports = model('Lease', leaseSchema);
