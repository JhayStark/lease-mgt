const User = require('../models/user');
const { object, string } = require('yup');
const { createAccessToken, createRefreshToken } = require('../../config/jwt');
const { sendSMS } = require('../../utilities/sms');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const {
  generateOtpAndGenerateToken,
  verifyOTPToken,
} = require('../../utilities/otp');

const phoneNumberRegExp = /\+233\d{9}/;

const userSchema = object({
  firstName: string().min(1, { message: 'First name required' }).required(),
  lastName: string().min(1, { message: 'Last name required' }).required(),
  idNumber: string().min(1, { message: 'Id required' }).required(),
  idType: string().min(1, { message: 'Id type is required' }).required(),
  phoneNumber: string()
    .matches(phoneNumberRegExp, {
      message: 'Phone number must be a vaild Ghanaian number',
    })
    .required(),
  email: string().email({ message: 'Email is required' }),
});

const createUser = async data => {
  const user = await userSchema.validate(data);

  const newUser = await User.create({
    ...user,
    name: `${user.firstName} ${user.lastName}`,
  });
  if (newUser) {
    sendSMS(
      user.phoneNumber,
      `Hello, ${user.firstName} Welcome to asset911 Lease Management`
    );
    return newUser;
  }
};

const addNewUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (user) return res.status(200).json(user);
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

const sendOtp = async (req, res) => {
  try {
    if (phoneNumberRegExp.test(req.body.phoneNumber) === false)
      return res.status(400).json('Invalid phone number');
    const user = await User.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) return res.status(400).json('Phone number does not exist');
    const otpResult = generateOtpAndGenerateToken(4);
    await sendSMS(
      user.phoneNumber,
      `Your OTP is ${otpResult.otp}, valid for 5 mins`
    );
    user.otp = otpResult.token;
    await user.save();
    res.status(200).json('Otp sent');
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const verifyUserByOtp = async (req, res) => {
  try {
    if (phoneNumberRegExp.test(req.body.phoneNumber) === false)
      return res.status(400).json('Invalid phone number');
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (otp == verifyOTPToken(user.otp)) {
      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      const userObject = {
        accessToken,
        refreshToken,
        firstName: user.firstName,
        email: user.email,
        idNumber: user.idNumber,
        phoneNumber: user.phoneNumber,
        idType: user.idType,
        lastName: user.lastName,
        id: user._id,
      };
      return res.status(200).json(userObject);
    }
    return res.status(400).json('Invalid OTP');
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const registerNewUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    const otpResult = generateOtpAndGenerateToken(4);
    await sendSMS(
      user.phoneNumber,
      `Your OTP is ${otpResult.otp}, valid for 5 mins`
    );
    user.otp = otpResult.token;
    await user.save();
    if (user) return res.status(200).json(user);
  } catch (error) {
    duplicateAndValidationErrorhandler(error, res);
  }
};

module.exports = {
  createUser,
  addNewUser,
  sendOtp,
  verifyUserByOtp,
  registerNewUser,
};
