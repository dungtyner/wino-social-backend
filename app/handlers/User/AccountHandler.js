const { getCountNotificationChat } = require('../../models/BoxChat');
const Account = require('../../models/Account');
const BoxChat = require('../../models/BoxChat');
const { findOneBySlug } = require('../../repositories/AccountRepository');
const friendOnlineService = require('../../services/FriendOnlineService');
const chatService = require('../../services/ChatService');
const socketClient = require('../../clients/socketClient');
require('dotenv').config();
global.listSocketOnline = [];

class AccountHandler {
  async checkIsActivated(user) {
    const account = user;
    socketClient.post('/listener/chatting', account);
    account.count_notification_chat = await getCountNotificationChat({
      id_account: account._id,
    });
    var result = {
      status: 200,
      account: account,
    };
    global.io.on('connect', (socket) => {
      socket.account = account;
      global.listSocketOnline.push(socket);
      socket.once(`I_AM_ONLINE`, () => {
        if (
          global.listSocketOnline.some(
            (el) => el.account.slug_personal == account.slug_personal,
          )
        ) {
          if (
            global.listSocketOnline.some(
              (el) => el.account.slug_personal == socket.account.slug_personal,
            )
          ) {
            console.log(`FRIEND_${account.slug_personal}_ONLINE`);
            global.io.emit(`FRIEND_${account.slug_personal}_ONLINE`, account);
          }
        }
        friendOnlineService.loadFriendOnline(account, socket);
      });

      socket.on('disconnect', () => {
        global.listSocketOnline.forEach((el, idx) => {
          if (el == socket) {
            global.listSocketOnline.splice(idx, 1);
            // console.log(global.listSocketOnline.length);
          }
        });
        if (
          !global.listSocketOnline.some(
            (el) => el.account.slug_personal == socket.account.slug_personal,
          )
        ) {
          console.log(`FRIEND_${socket.account.slug_personal}_OFFLINE`);
          global.io.emit(
            `FRIEND_${socket.account.slug_personal}_OFFLINE`,
            socket.account,
          );
        }
      });
    });

    return result;
  }

  signOut(req) {
    delete req.session.user;
    delete req.user;
    req.session.destroy();

    global.io.on('connection', (socket) => {
      socket.on(`I'M_SIGN_OUT`, async (dataAccount) => {
        await socket.disconnect();
        dataAccount.list_slug_friend.forEach(async (slug_friend) => {
          friendOnlineService.loadFriendOnline(
            await findOneBySlug(slug_friend),
            socket,
          );
        });
      });
    });
  }

  search = async (dto) => {
    const keyword = dto.keyword;
    return await Account.find().then((account) => {
      return account.filter(
        (data) =>
          (data.fname.toUpperCase() + ' ' + data.lname.toUpperCase()).indexOf(
            keyword.toUpperCase(),
          ) > -1,
      );
    });
  };

  async getPersonalPageWithSlug(slug_personal, user) {
    var ownerAccount = user;

    if (ownerAccount && ownerAccount.slug_personal !== slug_personal) {
      var id_chatPersonalPage = null;
      var otherAccount = await findOneBySlug(slug_personal);
      id_chatPersonalPage = await Promise.all(
        ownerAccount.list_id_box_chat.map(async (id_box_chat) => {
          var box_chat = await chatService.getDetailChatByUserId(
            id_box_chat,
            user.id,
          );
          if (
            box_chat.members.length == 2 &&
            box_chat.members.some(
              (member) =>
                otherAccount &&
                member.slug_member == otherAccount.slug_personal,
            )
          ) {
            id_chatPersonalPage = box_chat._id;
            return id_chatPersonalPage;
          }
        }),
      );
      id_chatPersonalPage = id_chatPersonalPage.filter(
        (id_chatPersonalPage) => typeof id_chatPersonalPage !== 'undefined',
      );

      if (id_chatPersonalPage.length == 0) {
        var new_boxChat = new BoxChat.BoxChat();
        new_boxChat.save();
        id_chatPersonalPage = [new_boxChat._id];
        otherAccount?.list_id_box_chat?.push(id_chatPersonalPage[0]);
        ownerAccount?.list_id_box_chat?.push(id_chatPersonalPage[0]);
        ownerAccount?.markModified('list_id_box_chat');
        otherAccount?.markModified('list_id_box_chat');

        otherAccount?.save();
        ownerAccount?.save();
        // global.io.emit(`ACCOUNT_${ownerAccount.slug_personal}_UPDATE`,ownerAccount)
      }

      return {
        result: otherAccount,
        id_chatPersonalPage: id_chatPersonalPage[0],
      };
    }

    return { result: ownerAccount };
  }
}
module.exports = new AccountHandler();
