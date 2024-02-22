const mongoose = require('mongoose');
const OwnerShipBody = require('../models/ownerShipBody');
const User = require('../../users/models/user');
const OwnerShipMember = require('../models/ownerShipMember');
const { object, string, array, mixed } = require('yup');
const { isValidId } = require('../../helpers/validators');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');

const ownerShipMemberSchema = array()
  .of(
    object({
      role: string()
        .oneOf(['Head', 'Family member', 'Associate', 'Co-owner', 'Manager'])
        .required(),
      userId: mixed()
        .test('isValidMongoId', 'Invalid userId', value => isValidId(value))
        .required(),
    })
  )
  .min(1);

const ownerShipBodySchema = object({
  name: string().required(),
  head: mixed()
    .test('isValidMongoId', 'Invalid head', value => isValidId(value))
    .required(),
  ownerShipId: string().required(),
  type: string()
    .oneOf(['Family', 'State', 'Organization', 'Individual'])
    .required(),
});

const createOwnerShipBody = async (req, res) => {
  try {
    const validSchema = await ownerShipBodySchema.validate(req.body);
    const exisitinghead = await User.findById(validSchema.head);
    if (!exisitinghead) {
      return res.status(400).json({ message: 'Invalid Family head' });
    }
    const newOwnerShipBody = await OwnerShipBody.create({
      ...validSchema,
    });

    const newOwnerShipMember = await OwnerShipMember.create({
      role: 'Head',
      userId: validSchema.head,
      ownerShipId: newOwnerShipBody._id,
    });

    if (newOwnerShipBody && newOwnerShipMember) {
      res.status(201).json({ message: 'Ownership Body created' });
    }
  } catch (error) {
    return duplicateAndValidationErrorhandler(error, res);
  }
};

const addOwnerShipBodyMember = async (req, res) => {
  try {
    const validSchema = await ownerShipMemberSchema.validate(req.body.members);

    const existingOwnerShipBody = await OwnerShipBody.findById(req.params.id);
    if (!existingOwnerShipBody) {
      return res.status(400).json({ message: 'Invalid Ownership Body' });
    }

    await OwnerShipMember.insertMany(
      validSchema.map(member => {
        return { ...member, ownerShipId: req.params.id };
      })
    );

    res.status(201).json({ message: 'Ownership Body members added' });
  } catch (error) {
    return duplicateAndValidationErrorhandler(error, res);
  }
};

const getOwnerShipBodies = async (req, res) => {
  try {
    let pageNumber = parseInt(req.query.pageNumber) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    const ownerShipId = req.query.ownerShipId || '';
    const headId = req.query.head || '';
    const headName = req.query.headName || '';
    const name = req.query.name || '';
    const bodyObjectId = isValidId(req.query.id)
      ? new mongoose.Types.ObjectId(req.query.id)
      : null;

    const aggregationPipline = [
      {
        $match: {
          ownerShipId: { $regex: ownerShipId, $options: 'i' },
          name: { $regex: name, $options: 'i' },
          _id: bodyObjectId || { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'head',
          foreignField: '_id',
          as: 'head',
        },
      },
      {
        $unwind: '$head',
      },
      {
        $match: {
          'head.idNumber': { $regex: headId, $options: 'i' },
          'head.name': { $regex: headName, $options: 'i' },
        },
      },
    ];

    const countResult = await OwnerShipBody.aggregate([
      ...aggregationPipline,
      { $count: 'total' },
    ]);

    const metaData = {
      pageNumber,
      pageSize,
      total: countResult.length ? countResult[0].total : 0,
    };

    if (metaData.total === 0) {
      return res.status(200).json({ result: [], metaData });
    }

    if (metaData.total < 10) {
      metaData.pageNumber = 1;
      metaData.pageSize = metaData.total;
    }

    const result = await OwnerShipBody.aggregate([
      ...aggregationPipline,
      { $sort: { createdAt: -1 } },
      { $skip: (metaData.pageNumber - 1) * metaData.pageSize },
      { $limit: metaData.pageSize },
    ]);

    res.status(200).json({ result, metaData });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//add pagination
const getOwnerShipBodyMembers = async (req, res) => {
  try {
    const ownerShipBodyId = isValidId(req.params.id)
      ? new mongoose.Types.ObjectId(req.params.id)
      : null;

    const aggregationPipline = [
      {
        $match: {
          ownerShipId: ownerShipBodyId,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ];
    const result = await OwnerShipMember.aggregate(aggregationPipline);
    res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createOwnerShipBody,
  addOwnerShipBodyMember,
  getOwnerShipBodies,
  getOwnerShipBodyMembers,
};
