const userRouter = require('express').Router();
const {
  getUsers,
  getUser,
  updateUser,
  getUserByIDNumber,
} = require('../controllers/user.controller');

userRouter.get('/all', getUsers);
userRouter.get('/:id', getUser);
userRouter.get('/head-search/:id', getUserByIDNumber);
userRouter.patch('/:id', updateUser);

module.exports = userRouter;
