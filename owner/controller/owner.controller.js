const mongoose = require('mongoose');
const OwnerShipBody = require('../models/ownerShipBody');
const User = require('../../users/models/user');
const OwnerShipMember = require('../models/ownerShipMember');
const { object, string, array, mixed } = require('yup');
const { isValidId } = require('../../helpers/validators');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const { officialsPermissions } = require('../../config/rolesAndPermissions');
const { sendSMS } = require('../../utilities/sms');
const {
  sendNotificationToMembersOfOwnerShipBody,
  sendNotificationToNewMembersOfOwnerShipBody,
} = require('../../utilities/notifications');

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
  type: string()
    .oneOf(['Family', 'State', 'Organization', 'Individual'])
    .required(),
});

function generateUniqueId() {
  const timestamp = Date.now().toString(36).toUpperCase(); // Base-36 timestamp for some uniqueness
  const randomChars = Math.random().toString(36).substr(2, 5).toUpperCase(); // 5 random characters

  return `${timestamp}-${randomChars}`;
}

const createOwnerShipBody = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.createOwnerShipBody)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const validSchema = await ownerShipBodySchema.validate(req.body);
    const exisitinghead = await User.findById(validSchema.head);
    if (!exisitinghead) {
      return res.status(400).json({ message: 'Invalid Family head' });
    }
    const ownerShipId = generateUniqueId();
    const newOwnerShipBody = await OwnerShipBody.create({
      ...validSchema,
      ownerShipId,
      search: `${validSchema.name} ${ownerShipId} ${exisitinghead.idNumber} ${exisitinghead.name}`,
    });

    const newOwnerShipMember = await OwnerShipMember.create({
      role: 'Head',
      userId: validSchema.head,
      ownerShipId: newOwnerShipBody._id,
    });

    if (newOwnerShipBody && newOwnerShipMember) {
      const inviteMessage = `Welcome to Asset911, a new property ownership body ${newOwnerShipBody.name} has been created with you as the Ownership Head`;
      sendSMS(exisitinghead.phoneNumber, inviteMessage);
      res.status(201).json({ message: 'Ownership Body created' });
    }
  } catch (error) {
    return duplicateAndValidationErrorhandler(error, res);
  }
};

const addOwnerShipBodyMember = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.createOwnerShipBodyMember)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
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
    sendNotificationToNewMembersOfOwnerShipBody(
      validSchema,
      `Hello, you have been added to the Ownership Body (${existingOwnerShipBody.name}).`
    );
    res.status(201).json({ message: 'Ownership Body members added' });
  } catch (error) {
    return duplicateAndValidationErrorhandler(error, res);
  }
};

const getOwnerShipBodies = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.readOwnerShipBody)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    let pageNumber = parseInt(req.query.pageNumber) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    const ownerShipId = req.query.ownerShipId || '';
    const headId = req.query.head || '';
    const headName = req.query.headName || '';
    const name = req.query.name || '';
    const search = req.query.search || '';
    const bodyObjectId = isValidId(req.query.id)
      ? new mongoose.Types.ObjectId(req.query.id)
      : null;

    const aggregationPipline = [
      {
        $match: {
          ownerShipId: { $regex: ownerShipId, $options: 'i' },
          name: { $regex: name, $options: 'i' },
          search: { $regex: search, $options: 'i' },
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

    const totalData = countResult[0]?.total || 0;

    const metaData = {
      pageNumber,
      pageSize,
      total: totalData,
      totalPages: Math.ceil(totalData / pageSize),
    };

    if (metaData.total === 0) {
      return res.status(200).json({ result: [], metaData });
    }

    const result = await OwnerShipBody.aggregate([
      ...aggregationPipline,
      { $sort: { createdAt: -1 } },
      {
        $project: {
          name: 1,
          ownerShipId: 1,
          type: 1,
          createdAt: 1,
          updatedAt: 1,
          'head.idNumber': 1,
          'head.email': 1,
          'head.phoneNumber': 1,
          'head.firstName': 1,
          'head.lastName': 1,
        },
      },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({ result, metaData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOwnerShipBodyMembers = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.readOwnerShipBodyMember)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const name = req.query.name || '';
    const idNumber = req.query.idNumber || '';
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
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
      {
        $match: {
          'user.name': { $regex: name, $options: 'i' },
          'user.idNumber': { $regex: idNumber, $options: 'i' },
        },
      },
    ];

    const countResult = await OwnerShipMember.aggregate([
      ...aggregationPipline,
      { $count: 'total' },
    ]);

    if (countResult.length === 0) {
      return res.status(200).json({ result: [] });
    }

    const totalData = countResult[0]?.total || 0;

    const metaData = {
      pageNumber,
      pageSize,
      total: totalData || 0,
      totalPages: Math.ceil(totalData / pageSize),
    };

    const result = await OwnerShipMember.aggregate([
      ...aggregationPipline,
      { $sort: { createdAt: -1 } },
      {
        $project: {
          userId: 1,
          ownerShipId: 1,
          role: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.idNumber': 1,
          'user.email': 1,
          'user.phoneNumber': 1,
        },
      },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({ result, ...metaData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOwnerShipBodyById = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.readOwnerShipBody)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const ownerShipBody = await OwnerShipBody.findById(req.params.id).populate([
      { path: 'head', select: '-password' },
    ]);
    if (!ownerShipBody) {
      return res.status(404).json({ message: 'Ownership Body not found' });
    }
    res.status(200).json(ownerShipBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOwnerShipBodyMemberById = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.readOwnerShipBodyMember)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const ownerShipMember = await OwnerShipMember.findById(
      req.params.id
    ).populate([
      { path: 'userId', select: '-password' },
      { path: 'ownerShipId' },
    ]);
    if (!ownerShipMember) {
      return res.status(404).json({ message: 'Ownership Member not found' });
    }
    res.status(200).json(ownerShipMember);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOwnerShipBody = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.updateOwnerShipBody)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const ownerShipBody = await OwnerShipBody.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!ownerShipBody) {
      return res.status(404).json({ message: 'Ownership Body not found' });
    }
    sendNotificationToMembersOfOwnerShipBody(
      req.params.id,
      `An update has occured on an OwnershipBody(${ownerShipBody.name}) you are a member of.`
    );
    res.status(200).json(ownerShipBody);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateOwnerShipBodyMember = async (req, res) => {
  const permissions = req.user.permissions;
  // if (!permissions.includes(officialsPermissions.updateOwnerShipBodyMember)) {
  //   return res.status(403).json({ message: 'Forbidden' });
  // }
  try {
    const ownerShipMember = await OwnerShipMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!ownerShipMember) {
      return res.status(404).json({ message: 'Ownership Member not found' });
    }
    res.status(200).json(ownerShipMember);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get users ownership bodies using aggregation pipeline allow search by name of ownership body
const getOwnerShipBodiesByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const name = req.query.name || '';
    const pageNumber = parseInt(req.query.pageNumber) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const aggregationPipline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'ownerships',
          localField: 'ownerShipId',
          foreignField: '_id',
          as: 'ownerShip',
        },
      },
      {
        $unwind: '$ownerShip',
      },
      {
        $match: {
          'ownerShip.name': { $regex: name, $options: 'i' },
        },
      },
    ];

    const countResult = await OwnerShipMember.aggregate([
      ...aggregationPipline,
      { $count: 'total' },
    ]);

    if (countResult.length === 0) {
      return res.status(200).json({ result: [] });
    }

    const totalData = countResult[0]?.total || 0;

    const metaData = {
      pageNumber,
      pageSize,
      total: totalData || 0,
      totalPages: Math.ceil(totalData / pageSize),
    };

    const result = await OwnerShipMember.aggregate([
      ...aggregationPipline,
      { $sort: { createdAt: -1 } },
      {
        $project: {
          userId: 1,
          ownerShipId: 1,
          role: 1,
          'ownerShip.name': 1,
          'ownerShip.ownerShipId': 1,
          'ownerShip.type': 1,
        },
      },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({ result, ...metaData });
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
  getOwnerShipBodyById,
  getOwnerShipBodyMemberById,
  updateOwnerShipBody,
  updateOwnerShipBodyMember,
  getOwnerShipBodiesByUserId,
};
