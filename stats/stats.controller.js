const User = require('../users/models/user');
const Property = require('../properties/models/property');
const OwnerShipbodies = require('../owner/models/ownerShipBody');

async function getVacantAndOccupiedCounts() {
  const today = new Date();

  // Count occupied properties (with an active lease)
  const occupiedCount = await Property.countDocuments({
    existingLease: { $ne: null }, // Property has an existing lease
  }).populate({
    path: 'existingLease',
    match: { endDate: { $gte: today } }, // Lease is still active
  });

  // Count vacant properties (no lease or expired lease)
  const vacantCount = await Property.countDocuments({
    $or: [
      { existingLease: null }, // No lease exists
      {
        existingLease: {
          $ne: null,
        },
      },
    ],
  }).populate({
    path: 'existingLease',
    match: { endDate: { $lt: today } }, // Lease has expired
  });

  return { occupied: occupiedCount, vacant: vacantCount };
}

//const statistics
const getStatistics = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const properties = await Property.countDocuments();
    const owners = await OwnerShipbodies.countDocuments();
    const familyOwners = await OwnerShipbodies.countDocuments({
      type: 'Family',
    });
    const stateOwners = await OwnerShipbodies.countDocuments({
      type: 'State',
    });
    const organizationOwners = await OwnerShipbodies.countDocuments({
      type: 'Organization',
    });
    const individualOwners = await OwnerShipbodies.countDocuments({
      type: 'Individual',
    });
    const stoolOwners = await OwnerShipbodies.countDocuments({
      type: 'Stool',
    });
    const vacantAndOccupiedCounts = await getVacantAndOccupiedCounts();
    const vacantProperties = vacantAndOccupiedCounts.vacant;
    const occupiedProperties = vacantAndOccupiedCounts.occupied;
    const data = {
      users,
      properties,
      owners,
      familyOwners,
      stateOwners,
      organizationOwners,
      individualOwners,
      stoolOwners,
      vacantProperties,
      occupiedProperties,
    };
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStatistics,
};
