const { findOneBySlug } = require('../../repositories/AccountRepository');
class FriendHandler {
  async getListFriend(user) {
    const dataAccount = user;

    const listFriend = await Promise.all(
      dataAccount.list_slug_friend.map(async (slug_friend) => {
        return await findOneBySlug(slug_friend);
      }),
    );

    return listFriend;
  }

  async requestAddFriend(user, dto) {
    var data_own_account = user;

    var data_friend_account = await findOneBySlug(dto.slug_friend);
    data_own_account.list_request_new_friend.push(
      new Obj_requestAddFriend({
        slug_friend: data_friend_account.slug_personal,
      }),
    );
    var response_new_friend = new Obj_requestAddFriend({
      slug_friend: data_own_account.slug_personal,
    });
    data_friend_account.list_response_new_friend.push(response_new_friend);
    console.log(data_friend_account);

    data_friend_account.notification.friend.response_new_friend.push(
      JSON.parse(
        JSON.stringify({
          time_request: response_new_friend.time_request,
          data_requester: data_own_account,
          isSeen: true,
        }),
      ),
    );
    data_friend_account.count_notification =
      data_friend_account.count_notification ?? 0 + 1;
    data_friend_account.markModified('notification');
    data_friend_account.markModified('list_response_new_friend');

    data_friend_account.save();
    data_own_account.save();
    global.io.emit(
      `${data_friend_account.slug_personal}_UPDATE_COUNT_NOTIFICATION`,
      data_friend_account,
    );
    global.io.emit(
      `${data_friend_account.slug_personal}_UPDATE_NOTIFICATION`,
      data_friend_account,
    );
    global.io.emit(
      `${data_friend_account.slug_personal}_UPDATE_LIST_RESPONSE_NEW_FRIEND`,
      data_friend_account,
    );
    global.io.emit(
      `${data_own_account.slug_personal}_UPDATE_REQUEST_ADD_NEW_FRIEND`,
      data_own_account,
    );
  }

  async cancelRequestAddFriend(user, dto) {
    const slug_friend = dto.slug_friend;
    const dataAccount_response = await findOneBySlug(slug_friend);

    const dataAccount_request = user;

    dataAccount_response.list_response_new_friend.forEach((item, idx) => {
      if (item.slug_friend == dataAccount_request.slug_personal) {
        dataAccount_response.list_response_new_friend.splice(idx, 1);
      }
    });
    dataAccount_request.list_request_new_friend.forEach((item, idx) => {
      if (item.slug_friend == dataAccount_response.slug_personal) {
        dataAccount_request.list_request_new_friend.splice(idx, 1);
      }
    });
    dataAccount_response.notification.friend.response_new_friend.forEach(
      (item, idx) => {
        console.log(item.data_requester.slug_personal, slug_friend);
        if (
          item.data_requester.slug_personal == dataAccount_request.slug_personal
        ) {
          dataAccount_response.notification.friend.response_new_friend.splice(
            idx,
            1,
          );
        }
      },
    );
    dataAccount_response.count_notification =
      dataAccount_response.count_notification ?? 0 + 1;
    dataAccount_response.markModified('notification');
    dataAccount_response.markModified('count_notification');
    dataAccount_response.markModified('list_response_new_friend');
    dataAccount_request.markModified('list_request_new_friend');
    dataAccount_response.save();
    dataAccount_request.save();
    global.io.emit(
      `${dataAccount_response.slug_personal}_UPDATE_NOTIFICATION`,
      dataAccount_response,
    );
    global.io.emit(
      `${dataAccount_request.slug_personal}_UPDATE_REQUEST_ADD_NEW_FRIEND`,
      dataAccount_request,
    );
    global.io.emit(
      `${dataAccount_response.slug_personal}_UPDATE_LIST_RESPONSE_NEW_FRIEND`,
      dataAccount_response,
    );
  }
}

function Obj_requestAddFriend({
  time_request = new Date().toISOString(),
  slug_friend,
} = {}) {
  this.time_request = time_request;
  this.slug_friend = slug_friend;
}

module.exports = new FriendHandler();
