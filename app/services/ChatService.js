const { findOneBySlug } = require('../repositories/AccountRepository');
const { BoxChat } = require('../models/BoxChat');

class ChatService {
  async getDetailChatByUserId(_id) {
    var data = await BoxChat.findOne({ _id });
    data.content_messages = await Promise.all(
      data.content_messages.map(async (content_message) => {
        var account_sender = await findOneBySlug(content_message.slug_sender);
        content_message.avatar_account = account_sender.avatar_account;
        data.members.forEach((member) => {
          if (member.slug_member == content_message.slug_sender) {
            if (member.nick_name) {
              content_message.name_sender = member.nick_name;
            } else {
              content_message.name_sender = `${account_sender.fname} ${account_sender.lname}`;
            }
          }
        });
        return content_message;
      }),
    );

    return data;
  }

  async load_roomSocket_Chat(account) {
    global.io.on('connect', () => {});
    var nsp_chat = global.io.of('/chat');

    await nsp_chat.on('connect', async (socket) => {
      // sockets.forEach( async socket=>{
      // console.log(`ACCOUNT ${account.slug_personal} CONNECT`);

      await account.list_id_box_chat.forEach(async (el) => {
        socket.join(`CHAT_${el}`);
        await socket.on(`IN_${el}_NO_TYPING`, (accountTyping) => {
          // console.log(`ACCOUNT ${accountTyping.slug_personal} NO TYPING`);
          socket.broadcast
            .to(`CHAT_${el}`)
            .emit(`IN_${el}_NO_TYPING`, accountTyping);
        });
        await socket.on(`IN_${el}_PEOPLE_TYPING`, (account) => {
          socket.broadcast
            .to(`CHAT_${el}`)
            .emit(`PEOPLE_${el}_TYPING`, account);
        });
      });
      // })
      socket.on('disconnect', () => {
        socket.removeAllListeners();
      });
    });

    await global.io.of('/chat').fetchSockets();
    console.log(global.io.of('/chat').adapter.rooms);
  }
}

module.exports = new ChatService();
