class NotificationHandler {
  async clearCountNotification(user) {
    user.count_notification = 0;
    user.save();
  }
}

module.exports = new NotificationHandler();
