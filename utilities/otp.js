const { sign, verify } = require('jsonwebtoken');

const generateOTP = length => {
  const characters = '0123456789';
  let OTP = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    OTP += characters[index];
  }
  return OTP;
};

const generateOtpAndGenerateToken = length => {
  const otp = generateOTP(length);
  const token = sign({ otp }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
  return { otp, token };
};

const verifyOTPToken = token => {
  const valid = verify(token, process.env.JWT_SECRET);
  if (valid) {
    return valid.otp;
  } else {
    return null;
  }
};
module.exports = { generateOTP, generateOtpAndGenerateToken, verifyOTPToken };
