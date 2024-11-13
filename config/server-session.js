const serverSessionRouter = require('express').Router();
const { verify } = require('jsonwebtoken');
const { createAccessToken, verifyRefreshToken } = require('./jwt');
const User = require('../users/models/user');
const Official = require('../officials/models/official.model');

serverSessionRouter.get('/', (req, res) => {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json('Authorization header missing');

  const accessToken = bearer.split(' ')[1];
  if (!accessToken) return res.status(401).json('Access token missing');

  try {
    const valid = verify(accessToken, process.env.JWT_SECRET);
    if (valid) {
      res.status(200).json(valid);
    } else {
      res.status(401).json('Invalid token');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
});

serverSessionRouter.get('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json('Unauthorized');
    let user;
    user = await User.findOne({ refreshToken });
    if (!user) user = await Official.findOne({ refreshToken });
    if (!user) return res.status(401).json('Unauthorized');
    const verifiedRefreshToken = verifyRefreshToken(refreshToken, user);
    if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
    const accessToken = createAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
});

serverSessionRouter.get('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) return res.status(200).json('Logged out');
    let user;
    user = await User.findOne({ refreshToken });
    if (!user) user = await Official.findOne({ refreshToken });
    if (!user) return res.status(401).json('Unauthorized');
    user.refreshToken = '';
    await user.save();
    res.clearCookie('refreshToken');
    res.status(200).json('Logged out');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

module.exports = serverSessionRouter;
