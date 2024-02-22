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
      required: true,
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
      ref: 'User',
    },
    beneficialOwner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    documents: {
      type: Array,
      required: true,
    },
    rentAmount: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model('Lease', leaseSchema);
