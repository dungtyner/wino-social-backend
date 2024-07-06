// const accountRoute = require('./account');
// const chatRoute = require('./chat');
// const notificationRoute = require('./notification');
// const friendRoute = require('./friend');
const healthyRoute = require('./healthy');

function route(app) {
  // app.use('/account', accountRoute);
  // app.use('/chat', chatRoute);
  // app.use('/notification', notificationRoute);
  // app.use('/friend', friendRoute);
  // app.use('/friends', friendRoute);
  app.use('/healthy', healthyRoute)
}
module.exports = route;
