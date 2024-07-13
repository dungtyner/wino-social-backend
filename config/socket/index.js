const { Server } = require('socket.io');

function configureSocket(server) {
  const io = new Server(server);
  global.io = io;

  return io;
}

module.exports = configureSocket;
