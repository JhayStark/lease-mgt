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
const upload = require('./config/multer-config');
const statisticsRouter = require('./stats/stats.route');

const app = express();

dotenv.config();
app.use(helmet());
app.use(morgan('dev'));
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const propertyUploadFields = upload.fields([
  { name: 'landCertificate', maxCount: 10 }, // Single file field
  { name: 'otherDocuments', maxCount: 10 }, // Multiple files field
  { name: 'sitePlan', maxCount: 10 },
]);

const leaseUploadFields = upload.fields([
  { name: 'documents', maxCount: 10 }, // Single file field
]);

app.use('/stats', statisticsRouter);
app.use('/session', serverSessionRouter);
app.use('/user-auth', authRouter);
app.use('/official-auth', officialAuthRouter);
app.use('/user', verifyToken, userRouter);
app.use('/officials', verifyToken, officialRouter);
app.use('/owner', verifyToken, ownerRouter);
app.use('/property', verifyToken, propertyUploadFields, propertyRouter);
app.use('/lease', verifyToken, leaseUploadFields, leaseRouter);
// app.use('/file-upload', uploadFields, (req, res) => {
//   try {
//     const files = req.files;
//     res.status(200).json({ files });
//   } catch (error) {
//     console.log(error);
//   }
// });

const PORT = process.env.PORT || 5000;

(async function start() {
  await dbConnect();
  app.listen(PORT, () => {
    console.log(`Server is running on:${PORT}`);
  });
})();
