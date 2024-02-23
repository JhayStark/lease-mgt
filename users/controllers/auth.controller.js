const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { object, string } = require('yup');
const { createAccessToken, createRefreshToken } = require('../../config/jwt');

const salt = bcrypt.genSaltSync(10);
const userSchema = object({
  firstName: string().min(1, { message: 'First name required' }).required(),
  lastName: string().min(1, { message: 'Last name required' }).required(),
  idNumber: string().min(1, { message: 'Id required' }).required(),
  idType: string().min(1, { message: 'Id type is required' }).required(),
  phoneNumber: string()
    .min(1, { message: 'Phone number is required' })
    .required(),
  email: string().email({ message: 'Email is required' }),
});

const createUser = async data => {
  const user = await userSchema.validate(data);
  user.password = `${user.phoneNumber}LM`;
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
  const userExists =
    (await User.findOne({ email: user.email })) ||
    (await User.findOne({ idNumber: user.idNumber })) ||
    (await User.findOne({ phoneNumber: user.phoneNumber }));
  if (userExists) throw new Error('user Exists');
  const newUser = await User.create(user);
  if (newUser) return newUser;
};

const addNewUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (user) return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      const userObject = {
        accessToken,
        refreshToken,
        firstName: user.firstName,
      };
      if (isMatch) return res.status(200).json(userObject);
      else return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.status(400).json({ message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createUser, loginUser, addNewUser };