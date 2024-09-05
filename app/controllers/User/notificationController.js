const notificationHandler = require('@/handlers/User/NotificationHandler');

class NotificationController {
  async getNotification(req, res) {
    res.success(req.user.notification);
  }

  async clearCountNotification(req, res) {
    notificationHandler.clearCountNotification(req.user);
    res.success({ mess: 'ok' });
  }
}
function NotificationResponseAddNewFriend({ friend, post }) {
  this.friend = friend;
  this.post = post;
}
module.exports = {
  NotificationController: new NotificationController(),
  NotificationResponseAddNewFriend,
};
