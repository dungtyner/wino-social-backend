class FriendOnlineService {
  loadFriendOnline(account, socket) {
    var list_friend_online = [];

    account.list_slug_friend.forEach((slug_friend) => {
      for (let i = 0; i < global.listSocketOnline.length; i++) {
        const element = global.listSocketOnline[i];
        if (element.account.slug_personal == slug_friend) {
          console.log(global.listSocketOnline.length);
          // if(!list_friend_online.some(el=>el.slug_personal==slug_friend))
          list_friend_online.push(element.account);
          break;
        }
      }
    });
    if (socket) {
      global.io
        .to(socket.id)
        .emit(
          `LIST_FRIEND_ONLINE_OF_${account.slug_personal}`,
          list_friend_online,
        );
    } else {
      global.io.emit(
        `LIST_FRIEND_ONLINE_OF_${account.slug_personal}`,
        list_friend_online,
      );
    }
  }
}

module.exports = new FriendOnlineService();
