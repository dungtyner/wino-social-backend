const express = require('express');
const isAuthenticated = require('../app/middlewares/auth');
const router = express.Router();
const notificationController =
  require('../app/controllers/User/notificationController').NotificationController;
router.get(
  '/get-notification',
  isAuthenticated,
  notificationController.getNotification,
);
router.get(
  '/clear-count-notification',
  isAuthenticated,
  notificationController.clearCountNotification,
);

module.exports = router;
