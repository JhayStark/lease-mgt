const mongoose = require('mongoose');
const Property = require('../models/property');
const OwnerShipBody = require('../../owner/models/ownerShipBody');
const { object, string, array, mixed } = require('yup');
const { isValidId } = require('../../helpers/validators');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const {
  sendNotificationToMembersOfOwnerShipBody,
} = require('../../utilities/notifications');
const fileUploader = require('../../utilities/file-upload');

const createPropertySchema = object({
  plotId: string().required(),
  gpsAddress: string().required(),
  ownerShipBodyId: mixed()
    .test('isValidMongoId', 'Invalid userId', value => isValidId(value))
    .required(),
  location: string().required(),
  region: string().required(),
  district: string().required(),
  coordinates: string().required(),
  // sitePlan: string().required(),
  // otherDocuments: array(),
  // landCertificate: string().required(),
});

const createProperty = async (req, res) => {
  try {
    const validProperty = await createPropertySchema.validate(req.body);

    const existingOwnerShipBody = await OwnerShipBody.findById(
      validProperty?.ownerShipBodyId
    );

    if (!existingOwnerShipBody) {
      return res.status(404).json({ message: 'Ownership body not found' });
    }

    const uploadData = await fileUploader(req.files);

    const newProperty = await Property.create({
      ...validProperty,
      ...uploadData,
    });
    if (!newProperty) {
      return res.status(400).json({ message: 'Property not created' });
    }
    sendNotificationToMembersOfOwnerShipBody(
      validProperty?.ownerShipBodyId,
      `A new property has been added to the properties of ${existingOwnerShipBody.name}.`
    );
    return res.status(201).json({
      message: 'Property Created',
    });
  } catch (error) {
    console.log(error);
    duplicateAndValidationErrorhandler(error, res);
  }
};

const getProperties = async (req, res) => {
  try {
    let pageSize = parseInt(req.query.pageSize) || 10;
    let pageNumber = parseInt(req.query.pageNumber) || 1;
    const plotId = req.query?.plotId || '';
    const region = req.query?.region || '';
    const district = req.query?.district || '';
    const location = req.query?.location || '';
    const coordinates = req.query?.coordinates || '';
    const ownerShipId = req.query?.ownerShipId || '';
    const ownerShipBodyId = req.query?.ownerShipBodyId || '';

    const aggregationPipeline = [
      {
        $match: {
          plotId: { $regex: plotId, $options: 'i' },
          region: { $regex: region, $options: 'i' },
          district: { $regex: district, $options: 'i' },
          location: { $regex: location, $options: 'i' },
          coordinates: { $regex: coordinates, $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'ownershipbodies',
          localField: 'ownerShipBodyId',
          foreignField: '_id',
          as: 'ownerShipBody',
        },
      },
      // { $unwind: '$ownerShipBody' },
      {
        $match: {
          'ownerShipBody.ownerShipId': { $regex: ownerShipId, $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerShipBody.head',
          foreignField: '_id',
          as: 'head',
        },
      },
      // { $unwind: '$head' },
    ];

    if (isValidId(ownerShipBodyId)) {
      aggregationPipeline.push({
        $match: {
          ownerShipBodyId: new mongoose.Types.ObjectId(ownerShipBodyId),
        },
      });
    }

    if (!isValidId(ownerShipBodyId) && ownerShipBodyId) {
      return res.status(400).json({ message: 'Invalid ownerShipBodyId' });
    }

    const countResult = await Property.aggregate([
      ...aggregationPipeline,
      { $count: 'total' },
    ]);

    const metaData = {
      pageNumber,
      pageSize,
      total: countResult[0]?.total || 0,
      totalPages: Math.ceil(countResult[0]?.total / pageSize) || 0,
    };

    const properties = await Property.aggregate([
      ...aggregationPipeline,
      { $sort: { createdAt: -1 } },
      {
        $project: {
          plotId: 1,
          gpsAddress: 1,
          location: 1,
          region: 1,
          district: 1,
          coordinates: 1,
          ownerShipBodyId: 1,
          ownerShipBody: 1,
          'head.firstName': 1,
          'head.lastName': 1,
          'head.phoneNumber': 1,
          'head.email': 1,
          sitePlan: 1,
          landCertificate: 1,
          createdAt: 1,
        },
      },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({ ...metaData, properties });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const publicUser = req.query.publicUser;
    const selectors = [];

    if (publicUser) {
      selectors.push('-otherDocuments', '-landCertificate');
    }

    const property = await Property.findById(propertyId)
      .populate([
        {
          path: 'ownerShipBodyId',
          populate: { path: 'head', select: '-password' },
        },
      ])
      .select(selectors);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    return res.status(200).json(property);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findByIdAndUpdate(propertyId, req.body, {
      new: true,
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    sendNotificationToMembersOfOwnerShipBody(
      property.ownerShipBodyId,
      `An update has occurred on the following property: ${property.plotId} located at ${property.location}.`
    );
    res.status(200).json(property);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
};
