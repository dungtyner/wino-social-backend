const express = require('express');
const router = express.Router();
const notificationController =
  require('../app/controllers/notificationController').NotificationController;
router.get(
  '/request_getNotification',
  notificationController.request_getNotification,
);
router.get(
  '/clearCountNotification',
  notificationController.request_clearCountNotification,
);

module.exports = router;
