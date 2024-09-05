const friendHandler = require('@/handlers/User/FriendHandler');
const {
  findOneById,
  findOneBySlug,
} = require('@/repositories/AccountRepository');
const AccountController = require('./AccountController');

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
  async getListFriend(req, res) {
    res.success({
      result: await friendHandler.getListFriend(req.user),
    });
  }
  async getListRequestFriend({ id }) {
    console.log('getListRequestFriend() running');
    var listFriend = [];
    var dataAccount = await findOneById(id);
    listFriend = await Promise.all(
      dataAccount.list_request_new_friend.map(async (friend) => {
        return await findOneBySlug(friend.slug_friend);
      }),
    );
    console.log(listFriend);
    return listFriend;
  }
  async getListResponseFriend({ id }) {
    console.log('getListResponseFriend() running');
    var listFriend = [];
    var dataAccount = await findOneById(id);
    listFriend = await Promise.all(
      dataAccount.list_response_new_friend.map(async (friend) => {
        return await findOneBySlug(friend.slug_friend);
      }),
    );
    console.log(listFriend);
    return listFriend;
  }
  async requestAddFriend(req, res) {
    friendHandler.requestAddFriend(req.user, req.dto);
    res.success(
      {
        mess: 'ok',
        // result:data_friend_account
      },
      200,
    );
  }
  async acceptAddNewFriend(req, res) {
    console.log('acceptAddNewFriend running');
    var slug_requester = req.body.data_res_new_friend;
    var dataAccount_request = await findOneBySlug(slug_requester);

    var dataAccount_response = await findOneById(req.session.loginEd);
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
    var dataAccount_unfriend = await findOneBySlug(req.body.slug_unfriend);
    var dataAccount_own = await findOneById(req.session.loginEd);
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
  async cancelRequestAddFriend(req, res) {
    friendHandler.cancelRequestAddFriend(req.user, req.dto);
    res.success({ mess: 'ok' }, 200);
  }
  async refuse_requestAddFriend(req, res) {
    var slug_requester = req.body.slug_friend;
    var dataAccount_request = await findOneBySlug(slug_requester);

    var dataAccount_response = await findOneById(req.session.loginEd);

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
module.exports = new FriendController();
