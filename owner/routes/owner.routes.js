const ownerRouter = require('express').Router();
const {
  createOwnerShipBody,
  addOwnerShipBodyMember,
  getOwnerShipBodies,
  getOwnerShipBodyMembers,
  getOwnerShipBodyMemberById,
  getOwnerShipBodyById,
  updateOwnerShipBody,
  updateOwnerShipBodyMember,
  getOwnerShipBodiesByUserId,
} = require('../controller/owner.controller');

ownerRouter.post('/add-ownershipbody', createOwnerShipBody);
ownerRouter.post('/add-ownershipbody-member/:id', addOwnerShipBodyMember);
ownerRouter.get('/get-ownershipbody', getOwnerShipBodies);
ownerRouter.get('/get-ownershipbody-members/:id', getOwnerShipBodyMembers);
ownerRouter.get('/get-ownershipbody-member/:id', getOwnerShipBodyMemberById);
ownerRouter.get('/get-ownershipbody/:id', getOwnerShipBodyById);
ownerRouter.patch('/update-ownershipbody/:id', updateOwnerShipBody);
ownerRouter.patch(
  '/update-ownershipbody-member/:id',
  updateOwnerShipBodyMember
);
ownerRouter.get('/get-ownerShipbodies-by-user/:id', getOwnerShipBodiesByUserId);

module.exports = ownerRouter;
