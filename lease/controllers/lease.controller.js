const mongoose = require('mongoose');
const Lease = require('../models/lease');
const Property = require('../../properties/models/property');
const OwnerShipMember = require('../../owner/models/ownerShipMember');
const { object, array, string, mixed, date } = require('yup');
const { isValidId } = require('../../helpers/validators');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const fileUploader = require('../../utilities/file-upload');

const leaseSchema = object({
  propertyId: mixed()
    .test('isValidMongoId', 'Invalid propertyId', value => isValidId(value))
    .required(),
  startDate: date().required(),
  endDate: date().required(),
  lessee: mixed()
    .test('isValidMongoId', 'Invalid UserId', value => isValidId(value))
    .required(),
  beneficialOwner: mixed()
    .test('isValidMongoId', 'Invalid UserId', value => isValidId(value))
    .required(),
  // documents: array().required(),
  groundRent: string().required(),
});

const createNewLease = async (req, res) => {
  try {
    const leaseBody = await leaseSchema.validate(req.body);
    const { propertyId, ...body } = leaseBody;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        message: 'Property not found',
      });
    }
    const uploadData = await fileUploader(req.files);

    const lease = await Lease.create({
      ...body,
      propertyId: property.id,
      ...uploadData,
      lessor: property.ownerShipBodyId,
    });
    property.existingLease = lease._id;
    await property.save();

    res.status(201).json(lease);
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const updateLease = async (req, res) => {
  try {
    const lease = await Lease.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(lease);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getLeases = async (req, res) => {
  let pageSize = parseInt(req.query.pageSize) || 10;
  let pageNumber = parseInt(req.query.pageNumber) || 1;
  const plotId = req.query?.plotId || '';
  const region = req.query?.region || '';
  const district = req.query?.district || '';
  const location = req.query?.location || '';
  const ownerShipBodyId = req.query?.ownerShipBodyId || '';
  const propertyId = req.query?.propertyId || '';
  try {
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property',
        },
      },
      { $unwind: '$property' },
      {
        $match: {
          'property.plotId': { $regex: plotId, $options: 'i' },
          'property.region': { $regex: region, $options: 'i' },
          'property.district': { $regex: district, $options: 'i' },
          'property.location': { $regex: location, $options: 'i' },
          // 'lessee.name': { $regex: lessee, $options: 'i' },
          // 'lessee.idNumber': { $regex: lesseeId, $options: 'i' },
        },
      },
    ];
    if (isValidId(propertyId)) {
      aggregationPipeline.unshift({
        $match: {
          propertyId: new mongoose.Types.ObjectId(propertyId),
        },
      });
    }
    if (isValidId(ownerShipBodyId)) {
      aggregationPipeline.unshift({
        $match: {
          lessor: new mongoose.Types.ObjectId(ownerShipBodyId),
        },
      });
    }
    const countResult = await Lease.aggregate([
      ...aggregationPipeline,
      { $count: 'total' },
    ]);

    const metaData = {
      pageNumber,
      pageSize,
      total: countResult[0]?.total || 0,
      totalPages: Math.ceil(countResult[0]?.total / pageSize) || 0,
    };

    const leases = await Lease.aggregate([
      ...aggregationPipeline,
      { $sort: { createdAt: -1 } },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({ ...metaData, leases });
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getLeaseById = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id).populate([
      'lessor',
      'propertyId',
      'createdBy',
      'beneficialOwner',
      'lessee',
    ]);
    res.status(200).json(lease);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const getOwnershipBodiesByUserId = async userId => {
  const ownershipMembers = await OwnerShipMember.find({ userId }).select(
    'ownerShipId'
  );
  return ownershipMembers.map(member => member.ownerShipId);
};

const getLeaseofAllUsersOwnershipbodies = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const ownershipBodyIds = await getOwnershipBodiesByUserId(userId);

    const leases = await Lease.find({
      $or: [
        { beneficialOwner: userId },
        { lessee: { $in: ownershipBodyIds } },
        { lessor: { $in: ownershipBodyIds } },
      ],
    }).populate(['propertyId', 'createdBy']);

    if (leases.length === 0) {
      return res.status(404).json({ message: 'No leases found for this user' });
    }

    res.status(200).json({ leases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createNewLease,
  getLeases,
  getLeaseById,
  updateLease,
  getLeaseofAllUsersOwnershipbodies,
};
