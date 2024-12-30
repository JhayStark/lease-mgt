const User = require('../models/user');
const { object, string } = require('yup');

const partialUserSchema = object({
  firstName: string().min(1, { message: 'First name required' }),
  lastName: string().min(1, { message: 'Last name required' }),
  idNumber: string().min(1, { message: 'Id required' }),
  idType: string().min(1, { message: 'Id type is required' }),
  phoneNumber: string().min(1, { message: 'Phone number is required' }),
  email: string().email({ message: 'Email is required' }),
});

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
    res.status(500).json({ message: 'Internel server error', error });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(['-password']);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internel server error', error });
  }
};

const updateUser = async (req, res) => {
  try {
    const userData = await partialUserSchema.validate(req.body);
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (userData.firstName || userData.lastName) {
      userData.name = `${userData.firstName ?? user?.firstName} ${
        userData.lastName ?? user.lastName
      }`;
    }

    user.set(userData);
    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internel server error', error });
  }
};

const getUserByIDNumber = async (req, res) => {
  try {
    const idNumber = req.params.id;
    const user = await User.findOne({ idNumber }).select(['-password']);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internel server error', error });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUser,
  getUserByIDNumber,
};
