const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConfig');
const credentials = require('./config/credentials');
const authRouter = require('./users/routes/auth.route');
const officialAuthRouter = require('./officials/routes/auth.routes');
const ownerRouter = require('./owner/routes/owner.routes');
const propertyRouter = require('./properties/routes/property.routes');
const leaseRouter = require('./lease/routes/lease.routes');
const userRouter = require('./users/routes/user.route');
const serverSessionRouter = require('./config/server-session');
const officialRouter = require('./officials/routes/official.routes');
const { corsOptions } = require('./config/corsOptions');
const { verifyToken } = require('./config/jwt');

const app = express();

dotenv.config();
app.use(helmet());
app.use(morgan('dev'));
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/session', serverSessionRouter);
app.use('/user-auth', authRouter);
app.use('/official-auth', officialAuthRouter);
app.use('/user', verifyToken, userRouter);
app.use('/officials', verifyToken, officialRouter);
app.use('/owner', verifyToken, ownerRouter);
app.use('/property', verifyToken, propertyRouter);
app.use('/lease', verifyToken, leaseRouter);

const PORT = process.env.PORT || 5000;

(async function start() {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on:${PORT}`);
  });
})();
