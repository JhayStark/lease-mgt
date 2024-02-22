const { connect } = require('mongoose');

async function dbConnect() {
  try {
    const connection = await connect(process.env.MONGO_URL);
    console.log(`Database Connected at ${connection.connection.host} `);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = dbConnect;
