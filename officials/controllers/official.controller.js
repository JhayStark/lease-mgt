const Official = require('../models/official.model');
const { createOfficial } = require('./auth.controller');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');

const updateOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const official = await Official.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (official) res.status(200).json('Updated Successfully');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const createNewOfficial = async (req, res) => {
  try {
    const newOfficial = await createOfficial(req.body);
    if (newOfficial)
      return res.status(201).json({ message: 'Official created successfully' });
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const getOfficial = async (req, res) => {
  try {
    const official = await Official.findById(req.params.id);
    if (!official) return res.status(404).json('Official not found');
    return res.status(200).json(official);
  } catch (error) {
    res.status(500).json('Internal server error');
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
    res.status(500).json('Internal server error');
  }
};

module.exports = {
  updateOfficial,
  createNewOfficial,
  getOfficial,
  getOfficials,
};
