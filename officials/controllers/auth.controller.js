const Official = require('../models/official.model');
const bcrypt = require('bcryptjs');
const { object, string, array } = require('yup');
const { createAccessToken, createRefreshToken } = require('../../config/jwt');
const {
  duplicateAndValidationErrorhandler,
} = require('../../helpers/errorHandlers');
const { officialsPermissions } = require('../../config/rolesAndPermissions');

const salt = bcrypt.genSaltSync(10);
const officialSchema = object({
  firstName: string().min(1, { message: 'First name required' }).required(),
  lastName: string().min(1, { message: 'Last name required' }).required(),
  staffId: string().min(1, { message: 'Id required' }).required(),
  email: string().email({ message: 'Email is required' }),
  password: string().min(8).required(),
  permissions: array().required(),
});

const createOfficial = async data => {
  const official = await officialSchema.validate(data);
  const hashedPassword = await bcrypt.hash(official.password, salt);
  official.password = hashedPassword;
  //remove after development
  official.permissions = [...Object.values(officialsPermissions)];
  const newOfficial = await Official.create({
    ...official,
    name: `${official.firstName} ${official.lastName}`,
  });
  if (newOfficial) return newOfficial;
};

const registerOfficial = async (req, res) => {
  try {
    const newOfficial = await createOfficial(req.body);
    if (newOfficial)
      return res.status(201).json({ message: 'Official created successfully' });
  } catch (error) {
    console.log(error);
    duplicateAndValidationErrorhandler(error, res);
  }
};

const loginOfficial = async (req, res) => {
  try {
    const { email, password } = req.body;
    const official = await Official.findOne({ email });
    if (official) {
      const isMatch = await bcrypt.compare(password, official.password);

      if (isMatch) {
        const accessToken = createAccessToken(official);
        const refreshToken = createRefreshToken(official);
        const officialObject = {
          accessToken,
          refreshToken,
          permissions: official.permissions,
          firstName: official.firstName,
        };
        official.refreshToken = refreshToken;
        await official.save();
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
          secure: true,
        });
        return res.status(200).json({ officialObject });
      } else return res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerOfficial, loginOfficial, createOfficial };
