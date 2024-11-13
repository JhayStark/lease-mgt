const axios = require('axios');

const sendEmail = async (recipient, subject, message) => {
  try {
    const response = await axios.post(process.env.EMAIL_API, {
      reciepient: recipient,
      subject,
      message,
    });
    return response;
  } catch (error) {
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };
