const { Schema, model } = require('mongoose');
const { boolean, string } = require('yup');

const leaseSchema = new Schema(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },
    createdByAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: () => (this.createdByAdmin ? 'Official' : 'User'),
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
    nameOfActingLessee: {
      type: String,
    },
    nameOfactingLessor: {
      type: String,
    },
  },
  { timestamps: true }
);

leaseSchema.index({ propertyId: 1, startDate: 1 }, { unique: true });

module.exports = model('Lease', leaseSchema);
