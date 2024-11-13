const axios = require('axios');

const sendSMS = async (number, message) => {
  try {
    const response = await axios.get(
      `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${process.env.SMS_API_USERNAME}&password=${process.env.SMS_API_PASSWORD}&type=0&dlr=1&destination=${number}&source=asset911&message=${message}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Error sending SMS');
  }
};

module.exports = { sendSMS };
