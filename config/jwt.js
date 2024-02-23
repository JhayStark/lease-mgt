const { sign, verify } = require('jsonwebtoken');

const createAccessToken = user => {
  const { id, name, email, permissions } = user;
  const token = sign({ id, name, email, permissions }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  return token;
};

const createRefreshToken = user => {
  const { id } = user;
  const token = sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  return token;
};

const verifyToken = (req, res, next) => {
  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer)
    return res.status(401).json({ message: 'Authorization header missing' });

  const accessToken = bearer.split(' ')[1];
  if (!accessToken)
    return res.status(401).json({ message: 'Access token missing' });

  try {
    const valid = verify(accessToken, process.env.JWT_SECRET);
    if (valid) {
      req.user = valid;
      next();
    } else {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const verifyRefreshToken = (refreshToken, user) => {
  const valid = verify(refreshToken, process.env.JWT_SECRET);
  if (!valid) return res.status(403).json({ message: 'Forbidden' });
  return valid.id === user.id;
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
