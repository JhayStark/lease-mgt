//ecfatum permissions
const ecfatumPermissions = {
  createInstitution: 201,
  createInstitutionAdmin: 202,
  readInstitution: 203,
  updateInstitution: 204,
};

//Officials permissions
const officialsPermissions = {
  createProperty: 301,
  readProperty: 302,
  updateProperty: 303,
  deleteProperty: 304,
  manageOfficial: 305,
  createOwnerShipBody: 306,
  readOwnerShipBody: 307,
  updateOwnerShipBody: 308,
  deleteOwnerShipBody: 309,
  createOfficial: 310,
  readOfficial: 311,
  updateOfficial: 312,
  deleteOfficial: 313,
  createUser: 314,
  readUser: 315,
  updateUser: 316,
  deleteUser: 317,
  createOwnerShipBodyMember: 318,
  readOwnerShipBodyMember: 319,
  updateOwnerShipBodyMember: 320,
  deleteOwnerShipBodyMember: 321,
};

module.exports = { ecfatumPermissions, officialsPermissions };
