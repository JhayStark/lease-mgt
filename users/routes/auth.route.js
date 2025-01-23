const authRouter = require('express').Router();
const {
  addNewUser,
  sendOtp,
  verifyUserByOtp,
  registerNewUser,
} = require('../controllers/auth.controller');

authRouter.post('/add', addNewUser);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyUserByOtp);
authRouter.post('/register', registerNewUser);

module.exports = authRouter;
