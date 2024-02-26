const leaseRouter = require('express').Router();
const {
  createNewLease,
  getLeases,
  getLeaseById,
} = require('../controllers/lease.controller');

leaseRouter.post('/add', createNewLease);
leaseRouter.get('/all', getLeases);
leaseRouter.get('/:id', getLeaseById);

module.exports = leaseRouter;
