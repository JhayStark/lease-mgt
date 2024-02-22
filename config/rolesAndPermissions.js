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
};

module.exports = { ecfatumPermissions, officialsPermissions };
