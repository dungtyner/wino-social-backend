const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
require('dotenv').config();
require('module-alias/register');
const Sentry = require('@sentry/node');

const configureSentry = require('@wn-config/sentry');
const connectDB = require('@wn-config/db/');
const configureCors = require('@wn-config/cors');
const configureExpress = require('@wn-config/express');
const route = require('@wn-router');
const configureSession = require('@wn-config/session');
const configureSocket = require('@wn-config/socket');
const exceptionHandler = require('@/middlewares/exceptionHandler');
const successHandler = require('@/middlewares/successHandler');

configureSentry(app);
connectDB();
configureCors(app);
configureExpress(app);
configureSession(app);
const io = configureSocket(server);

Sentry.setupExpressErrorHandler(app);

app.use(successHandler);
route(app);
app.use(exceptionHandler);

module.exports = { io };

server.listen(process.env.PORT || 5000, () => {
  console.log('SV started!!!');
});
