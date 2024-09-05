const axios = require('axios');
require('dotenv').config();

const socketClient = axios.create({
  baseURL: process.env.SOCKET_HOST,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = socketClient;
