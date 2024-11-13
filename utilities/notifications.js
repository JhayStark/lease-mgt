const OwnerShipMember = require('../owner/models/ownerShipMember');
const User = require('../users/models/user');
const { sendSMS } = require('./sms');

const sendNotificationToMembersOfOwnerShipBody = async (
  ownerShipBodyId,
  message
) => {
  OwnerShipMember.find({ ownerShipId: ownerShipBodyId })
    .populate('userId')
    .then(res => {
      const members = res.map(member => member.userId.phoneNumber);
      sendSMS(members, message).catch(err => console.log(err));
    });
};

const sendNotificationToNewMembersOfOwnerShipBody = async (
  members,
  message
) => {
  const foundMembers = members.map(async member => {
    const user = await User.findById(member.userId);
    return user.phoneNumber;
  });
  const results = await Promise.all(foundMembers);

  sendSMS(results, message).catch(err => console.log(err));
};

module.exports = {
  sendNotificationToMembersOfOwnerShipBody,
  sendNotificationToNewMembersOfOwnerShipBody,
};
