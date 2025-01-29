const GroundRent = require('../models/ground-rent');

const addGroundRent = async (req, res) => {
  try {
    const groundRent = await GroundRent.create(req.body);
    res.status(201).json(groundRent);
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const getGroundRentPayments = async (req, res) => {
  try {
    const { leaseId, propertyId, paidBy } = req.query;
    const { page = 1, limit = 10 } = req.query;

    const query = {};
    if (leaseId) query.leaseId = leaseId;
    if (propertyId) query.propertyId = propertyId;
    if (paidBy) query.paidBy = paidBy;

    const skip = (page - 1) * limit;
    const total = await GroundRent.countDocuments(query);
    const payments = await GroundRent.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addGroundRent,
  getGroundRentPayments,
};
