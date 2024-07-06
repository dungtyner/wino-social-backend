const {
  getDataAccount_byID,
  getDataAccount_bySlug,
} = require('../models/Account');
const AccountController = require('./accountController');

class FriendController {
  async req_getListRequestFriend(req, res) {
    res.send({
      result: await new FriendController().getListRequestFriend({
        id: req.session.loginEd,
      }),
    });
  }
  async req_getListResponseFriend(req, res) {
    res.send({
      result: await new FriendController().getListResponseFriend({
        id: req.session.loginEd,
      }),
    });
  }
  async req_getListFriend(req, res) {
    console.log(req.session.loginEd);

    res.send({
      result: await new FriendController().getListFriend({
        id: req.session.loginEd,
      }),
    });
  }
  async getListFriend({ id }) {
    console.log('getListFriend() running');
    var listFriend = [];
    var dataAccount = await getDataAccount_byID(id);
    listFriend = await Promise.all(
      dataAccount.list_slug_friend.map(async (slug_friend) => {
        return await getDataAccount_bySlug(slug_friend);
      }),
    );
    console.log(listFriend);
    return listFriend;
  }
  async getListRequestFriend({ id }) {
    console.log('getListRequestFriend() running');
    var listFriend = [];
    var dataAccount = await getDataAccount_byID(id);
    listFriend = await Promise.all(
      dataAccount.list_request_new_friend.map(async (friend) => {
        return await getDataAccount_bySlug(friend.slug_friend);
      }),
    );
    console.log(listFriend);
    return listFriend;
  }
  async getListResponseFriend({ id }) {
    console.log('getListResponseFriend() running');
    var listFriend = [];
    var dataAccount = await getDataAccount_byID(id);
    listFriend = await Promise.all(
      dataAccount.list_response_new_friend.map(async (friend) => {
        return await getDataAccount_bySlug(friend.slug_friend);
      }),
    );
    console.log(listFriend);
    return listFriend;
  }
  async requestAddFriend(req, res) {
    var data_own_account = await getDataAccount_byID(req.session.loginEd);

    var data_friend_account = await getDataAccount_bySlug(req.body.slug_friend);
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
    data_friend_account.count_notification += 1;
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
    res.send({
      mess: 'ok',
      // result:data_friend_account
    });
  }
  async acceptAddNewFriend(req, res) {
    console.log('acceptAddNewFriend running');
    var slug_requester = req.body.data_res_new_friend;
    var dataAccount_request = await getDataAccount_bySlug(slug_requester);

    var dataAccount_response = await getDataAccount_byID(req.session.loginEd);
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
        console.log(item.data_requester.slug_personal, slug_requester);
        if (item.data_requester.slug_personal == slug_requester) {
          dataAccount_response.notification.friend.response_new_friend.splice(
            idx,
            1,
          );
        }
      },
    );
    dataAccount_request.notification.friend.accept_friend.push(
      JSON.parse(
        JSON.stringify({
          time_accept: new Date().toISOString(),
          data_accepter: dataAccount_response,
        }),
      ),
    );
    dataAccount_response.list_slug_friend.push(
      dataAccount_request.slug_personal,
    );
    dataAccount_request.list_slug_friend.push(
      dataAccount_response.slug_personal,
    );
    dataAccount_response.markModified('list_slug_friend');
    dataAccount_request.markModified('list_slug_friend');
    dataAccount_request.markModified('notification');
    dataAccount_response.markModified('notification');
    dataAccount_response.markModified('list_response_new_friend');
    dataAccount_request.markModified('list_request_new_friend');
    dataAccount_response.save();
    dataAccount_request.save();
    global.io.emit(
      `${dataAccount_request.slug_personal}_UPDATE_LIST_SLUG_FRIEND`,
      dataAccount_request,
    );
    global.io.emit(
      `${dataAccount_response.slug_personal}_UPDATE_LIST_SLUG_FRIEND`,
      dataAccount_response,
    );
    AccountController.loadFriendOnline(dataAccount_request);
    AccountController.loadFriendOnline(dataAccount_response);
    res.send({ mess: 'ok' });
  }
  async unFriend(req, res) {
    console.log('unFriend() running');
    var dataAccount_unfriend = await getDataAccount_bySlug(
      req.body.slug_unfriend,
    );
    var dataAccount_own = await getDataAccount_byID(req.session.loginEd);
    dataAccount_own.list_slug_friend.forEach((slug_friend, idx) => {
      if (slug_friend == dataAccount_unfriend.slug_personal) {
        dataAccount_own.list_slug_friend.splice(idx, 1);
      }
    });
    dataAccount_unfriend.list_slug_friend.forEach((slug_friend, idx) => {
      if (slug_friend == dataAccount_own.slug_personal) {
        dataAccount_unfriend.list_slug_friend.splice(idx, 1);
      }
    });
    console.log(
      'dataAccount_unfriend.list_slug_friend',
      dataAccount_unfriend.list_slug_friend,
    );
    console.log(
      'dataAccount_own.list_slug_friend',
      dataAccount_own.list_slug_friend,
    );
    dataAccount_unfriend.markModified('list_slug_friend');
    dataAccount_unfriend.save();
    dataAccount_own.markModified('list_slug_friend');
    dataAccount_own.save();
    global.io.emit(
      `${dataAccount_unfriend.slug_personal}_UPDATE_LIST_SLUG_FRIEND`,
      dataAccount_unfriend,
    );
    await global.io.emit(
      `FRIEND_${dataAccount_unfriend.slug_personal}_OFFLINE`,
      dataAccount_unfriend,
    );
    await global.io.emit(
      `FRIEND_${dataAccount_own.slug_personal}_OFFLINE`,
      dataAccount_own,
    );
    res.send({ mess: 'ok' });
  }
  async remove_requestAddFriend(req, res) {
    var slug_friend = req.body.slug_friend;
    var dataAccount_response = await getDataAccount_bySlug(slug_friend);

    var dataAccount_request = await getDataAccount_byID(req.session.loginEd);

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
    dataAccount_response.count_notification += 1;
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
    res.send({ mess: 'ok' });
  }
  async refuse_requestAddFriend(req, res) {
    var slug_requester = req.body.slug_friend;
    var dataAccount_request = await getDataAccount_bySlug(slug_requester);

    var dataAccount_response = await getDataAccount_byID(req.session.loginEd);

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
        console.log(item.data_requester.slug_personal, slug_requester);
        if (item.data_requester.slug_personal == slug_requester) {
          dataAccount_response.notification.friend.response_new_friend.splice(
            idx,
            1,
          );
        }
      },
    );
    dataAccount_response.markModified('notification');
    dataAccount_response.markModified('list_response_new_friend');
    dataAccount_request.markModified('list_request_new_friend');
    dataAccount_response.save();
    dataAccount_request.save();
    global.io.emit(
      `${dataAccount_request.slug_personal}_UPDATE_REQUEST_ADD_NEW_FRIEND`,
      dataAccount_request,
    );
    global.io.emit(
      `${dataAccount_response.slug_personal}_UPDATE_LIST_RESPONSE_NEW_FRIEND`,
      dataAccount_response,
    );

    res.send({ mess: 'ok' });
  }
}
function Obj_requestAddFriend({
  time_request = new Date().toISOString(),
  slug_friend,
} = {}) {
  this.time_request = time_request;
  this.slug_friend = slug_friend;
}
module.exports = new FriendController();
