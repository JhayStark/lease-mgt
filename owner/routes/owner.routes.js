const ownerRouter = require('express').Router();
const {
  createOwnerShipBody,
  addOwnerShipBodyMember,
  getOwnerShipBodies,
  getOwnerShipBodyMembers,
} = require('../controller/owner.controller');

ownerRouter.post('/add-ownershipbody', createOwnerShipBody);
ownerRouter.post('/add-ownershipbody-member/:id', addOwnerShipBodyMember);
ownerRouter.get('/get-ownershipbody', getOwnerShipBodies);
ownerRouter.get('/get-ownershipbody-members/:id', getOwnerShipBodyMembers);

module.exports = ownerRouter;
