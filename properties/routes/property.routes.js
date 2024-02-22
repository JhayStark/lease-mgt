const propertyRouter = require('express').Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
} = require('../controllers/property.controller');

propertyRouter.post('/add', createProperty);
propertyRouter.get('/all', getProperties);
propertyRouter.get('/:id', getPropertyById);

module.exports = propertyRouter;
