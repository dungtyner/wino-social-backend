const session = require('express-session');
require('dotenv').config();

var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions',
});

function configureSession(app) {
  app.use(
    session({
      secret: process.env.ACCESS_TOKEN_CODE,
      saveUninitialized: false,
      proxy: true,
      resave: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 48,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
      store: store,
    }),
  );
}

module.exports = configureSession;
