const authRouter = require('express').Router();
const {
  registerOfficial,
  loginOfficial,
} = require('../controllers/auth.controller');

authRouter.post('/register', registerOfficial);
authRouter.post('/login', loginOfficial);

module.exports = authRouter;
