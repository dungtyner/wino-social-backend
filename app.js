const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
require('dotenv').config();

const connectDB = require('./config/db/');
const route = require('./routes/index');
const configureSession = require('./config/session');
const configureCors = require('./config/cors');
const configureExpress = require('./config/express');
const configureSocket = require('./config/socket');
const exceptionHandler = require('./app/middlewares/exceptionHandler');
const successHandler = require('./app/middlewares/successHandler');

connectDB();
configureCors(app);
configureExpress(app);
configureSession(app);
app.use(successHandler);
route(app);
app.use(exceptionHandler);
const io = configureSocket(server);

module.exports = { io };

server.listen(process.env.PORT || 5000, () => {
  console.log('SV started!!!');
});
