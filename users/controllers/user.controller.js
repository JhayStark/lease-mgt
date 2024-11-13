const User = require('../models/user');

const getUsers = async (req, res) => {
  const pageNumber = req.query.pageNumber || 1;
  const pageSize = req.query.pageSize || 10;
  const name = req.query.name || '';
  const email = req.query.email || '';
  const idNumber = req.query.idNumber || '';
  const phoneNumber = req.query.phoneNumber || '';

  try {
    const aggregationPipeline = [
      {
        $match: {
          name: { $regex: name, $options: 'i' },
          email: { $regex: email, $options: 'i' },
          idNumber: { $regex: idNumber, $options: 'i' },
          phoneNumber: { $regex: phoneNumber, $options: 'i' },
        },
      },
      { $unset: ['password'] },
    ];

    const count = await User.aggregate([
      ...aggregationPipeline,
      { $count: 'total' },
    ]);
    const metaData = {
      pageNumber,
      pageSize,
      totalPages: Math.ceil(count[0]?.total || 0 / pageSize),
      total: count[0]?.total || 0,
    };
    const results = await User.aggregate([
      ...aggregationPipeline,
      { $sort: { createdAt: -1 } },
    ])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    res.status(200).json({ ...metaData, results });
  } catch (error) {
    res.status(500).json({ message: 'Internel server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(['-password']);
    if (user) {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internel server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (user) {
      res.status(200).json({ message: 'User updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internel server error' });
  }
};

const getUserByIDNumber = async (req, res) => {
  try {
    const idNumber = req.params.id;
    const user = await User.findOne({ idNumber }).select(['-password']);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internel server error' });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  getUserByIDNumber,
};
