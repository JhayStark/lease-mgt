const allowedOrigins = [];

if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(process.env.WEB_URL);
} else {
  allowedOrigins.push('*');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = { corsOptions, allowedOrigins };
