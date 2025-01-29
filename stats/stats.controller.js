const User = require('../users/models/user');
const Property = require('../properties/models/property');
const OwnerShipbodies = require('../owner/models/ownerShipBody');

//const statistics
const getStatistics = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const properties = await Property.countDocuments();
    const owners = await OwnerShipbodies.countDocuments();
    const data = {
      users,
      properties,
      owners,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatistics,
};
