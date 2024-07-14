const isAuthenticated = require('../app/middlewares/auth');
const accountRoute = require('./account');
// const chatRoute = require('./chat');
// const notificationRoute = require('./notification');
// const friendRoute = require('./friend');
const healthyRoute = require('./healthy');
const authRoute = require('./auth');

function route(app) {
  app.use('/v1/account', isAuthenticated, accountRoute);
  // app.use('/chat', chatRoute);
  // app.use('/notification', notificationRoute);
  // app.use('/friend', friendRoute);
  // app.use('/friends', friendRoute);
  app.use('/v1/healthy', healthyRoute);
  app.use('/v1/auth', authRoute);
}
module.exports = route;
