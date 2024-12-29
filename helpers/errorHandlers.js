const { ValidationError } = require('yup');

const duplicateAndValidationErrorhandler = (error, res) => {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Duplicate Document' });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json(error);
};

module.exports = { duplicateAndValidationErrorhandler };
