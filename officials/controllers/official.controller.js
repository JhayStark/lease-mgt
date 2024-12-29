const Official = require('../models/official.model');
const { createOfficial } = require('./auth.controller');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const { object, string, array } = require('yup');

const partialOfficialSchema = object({
  firstName: string().min(1, { message: 'First name required' }),
  lastName: string().min(1, { message: 'Last name required' }),
  staffId: string().min(1, { message: 'Id required' }),
  email: string().email({ message: 'Email is required' }),
  password: string().min(8),
  permissions: array(),
});

const updateOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const patchData = await partialOfficialSchema.validate(req.body);
    const official = await Official.findById(id);
    if (!official) {
      return res.status(404).json({ message: 'Official not found' });
    }

    if (patchData.firstName || patchData.lastName) {
      patchData.name = `${patchData.firstName || official.firstName} ${
        patchData.lastName || official.lastName
      }`;
    }

    official.set(patchData);
    await official.save();
    res.status(200).json('Updated Successfully');
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const createNewOfficial = async (req, res) => {
  try {
    const newOfficial = await createOfficial(req.body);
    if (newOfficial)
      return res.status(201).json('Official created successfully');
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const getOfficial = async (req, res) => {
  try {
    const official = await Official.findById(req.params.id);
    if (!official) return res.status(404).json('Official not found');
    res.status(200).json(official);
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const getOfficials = async (req, res) => {
  const name = req.query.name || '';
  const staffId = req.query.staffId || '';
  const email = req.query.email || '';
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  try {
    const aggregationPipeline = [
      {
        $match: {
          name: { $regex: name, $options: 'i' },
          staffId: { $regex: staffId, $options: 'i' },
          email: { $regex: email, $options: 'i' },
        },
      },
    ];

    const count = await Official.aggregate([
      ...aggregationPipeline,
      { $count: 'total' },
    ]);

    const metaData = {
      pageNumber,
      pageSize,
      totalPages: Math.ceil(count[0]?.total || 0 / pageSize),
      total: count[0]?.total || 0,
    };

    const results = await Official.aggregate([
      ...aggregationPipeline,
      { $unset: ['password', 'refreshToken'] },
      { $sort: { createdAt: -1 } },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({ ...metaData, results });
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

module.exports = {
  updateOfficial,
  createNewOfficial,
  getOfficial,
  getOfficials,
};
