const authRouter = require('express').Router();
const { loginUser, addNewUser } = require('../controllers/auth.controller');

authRouter.post('/', loginUser);
authRouter.post('/add', addNewUser);

module.exports = authRouter;
