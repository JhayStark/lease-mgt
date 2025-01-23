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
    recievedBy: {
      type: String,
      ref: 'User',
    },
    a: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    documents: {
      type: Object,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

groundRentSchema.index({ propertyId: 1, startDate: 1 }, { unique: true });

module.exports = model('GroundRent', groundRentSchema);
