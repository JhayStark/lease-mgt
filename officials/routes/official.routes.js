const {
  createNewOfficial,
  getOfficial,
  getOfficials,
  updateOfficial,
} = require('../controllers/official.controller');

const officialRouter = require('express').Router();

officialRouter.post('/', createNewOfficial);
officialRouter.get('/', getOfficials);
officialRouter.get('/:id', getOfficial);
officialRouter.patch('/:id', updateOfficial);

module.exports = officialRouter;
