const leaseRouter = require('express').Router();
const {
  createNewLease,
  getLeases,
  getLeaseById,
  getLeaseofAllUsersOwnershipbodies,
  updateLease,
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
leaseRouter.get('/user/:userId', getLeaseofAllUsersOwnershipbodies);

module.exports = leaseRouter;
