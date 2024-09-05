const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
require('dotenv').config();
require('module-alias/register');

const connectDB = require('./config/db/');
const configureCors = require('./config/cors');
const configureExpress = require('./config/express');
const route = require('./routes/index');
const configureSession = require('./config/session');
const configureSocket = require('./config/socket');
const exceptionHandler = require('./app/middlewares/exceptionHandler');
const successHandler = require('./app/middlewares/successHandler');

connectDB();
configureCors(app);
configureExpress(app);
configureSession(app);
const io = configureSocket(server);
app.use(successHandler);
route(app);
app.use(exceptionHandler);

module.exports = { io };

server.listen(process.env.PORT || 5000, () => {
  console.log('SV started!!!');
});
