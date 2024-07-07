const express = require('express');
const session = require('express-session');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const body_pa = require('body-parser');
const multer = require('multer');
const uploads = multer();
require('dotenv').config();
global.uploads = uploads;
global.io = io;

var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions',
});

const connectDB = require('./config/db/');
connectDB();
const route = require('./routes/index');

app.use(
  cors({
    origin: [process.env.CLIENT_UI_HOST],
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
  }),
);
app.use(express.json());
app.use(body_pa.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_CODE,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 48,
      sameSite: 'none',
    },
    store: store,
  }),
);
route(app);
module.exports = { io };
server.listen(process.env.PORT || 5000, () => {
  console.log('SV started!!!');
});
