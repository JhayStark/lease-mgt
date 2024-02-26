const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const dbConnect = require('./config/dbConfig');
const credentials = require('./config/credentials');
const authRouter = require('./users/routes/auth.route');
const officialAuthRouter = require('./officials/routes/auth.routes');
const ownerRouter = require('./owner/routes/owner.routes');
const propertyRouter = require('./properties/routes/property.routes');
const leaseRouter = require('./lease/routes/lease.routes');
const { verifyToken } = require('./config/jwt');

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(helmet());
app.use(morgan('dev'));
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/official', officialAuthRouter);
app.use('/owner', verifyToken, ownerRouter);
app.use('/property', propertyRouter);
app.use('/lease', leaseRouter);

(async function start() {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on:${PORT}`);
  });
})();
