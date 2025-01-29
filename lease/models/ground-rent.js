const { Schema, model } = require('mongoose');

const groundRentSchema = new Schema(
  {
    leaseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Lease',
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    amountPaid: {
      type: String,
      required: true,
    },
    documents: {
      type: Object,
    },
    leaseStartDate: {
      type: Date,
      required: true,
    },
    leaseEndDate: {
      type: Date,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank transfer', 'Momo', 'Cheque'],
    },
    paymentDetails: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = model('GroundRent', groundRentSchema);
