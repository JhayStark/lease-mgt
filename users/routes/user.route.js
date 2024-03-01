const userRouter = require('express').Router();
const {
  getUsers,
  getUser,
  updateUser,
} = require('../controllers/user.controller');

userRouter.get('/all', getUsers);
userRouter.get('/:id', getUser);
userRouter.patch('/:id', updateUser);

module.exports = userRouter;
