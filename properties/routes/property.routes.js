const propertyRouter = require('express').Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
} = require('../controllers/property.controller');

propertyRouter.post('/add', createProperty);
propertyRouter.get('/all', getProperties);
propertyRouter.get('/:id', getPropertyById);
propertyRouter.patch('/update/:id', updateProperty);

module.exports = propertyRouter;
