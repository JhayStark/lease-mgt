const authRouter = require('express').Router();
const {
  addNewUser,
  sendOtp,
  verifyUserByOtp,
} = require('../controllers/auth.controller');

authRouter.post('/add', addNewUser);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyUserByOtp);

module.exports = authRouter;
