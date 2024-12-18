const { Schema, model } = require('mongoose');

const propertySchema = new Schema(
  {
    plotId: { type: String, required: true, unique: true },
    gpsAddress: { type: String },
    ownerShipBodyId: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'OwnerShipBody',
      },
    ],
    location: { type: String, required: true },
    region: { type: String, required: true },
    district: { type: String, required: true },
    coordinates: { type: String, required: true },
    sitePlan: { type: String, required: true },
    otherDocuments: { type: Array, required: true },
    landCertificate: { type: String, required: true },
    existingLease: {
      type: Schema.Types.ObjectId,
      ref:'Lease'
    },
  },
  { timestamps: true }
);

propertySchema.index({ plotId: 1, ownerShipBodyId: 1 }, { unique: true });

module.exports = model('Property', propertySchema);
