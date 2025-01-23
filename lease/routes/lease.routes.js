const leaseRouter = require('express').Router();
const {
  createNewLease,
  getLeases,
  getLeaseById,
} = require('../controllers/lease.controller');
const {
  addGroundRent,
  getGroundRentPayments,
} = require('../controllers/ground-rent.controller');

leaseRouter.post('/add', createNewLease);
leaseRouter.get('/all', getLeases);
leaseRouter.get('/:id', getLeaseById);
leaseRouter.post('/ground-rent/add', addGroundRent);
leaseRouter.get('/ground-rent', getGroundRentPayments);

module.exports = leaseRouter;
