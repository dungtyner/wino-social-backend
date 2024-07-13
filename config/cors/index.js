const cors = require('cors');
require('dotenv').config();

function configureCors(app) {
  app.use(
    cors({
      origin: [process.env.CLIENT_UI_HOST],
      methods: ['GET', 'POST'],
      credentials: true,
    }),
  );
}

module.exports = configureCors;
