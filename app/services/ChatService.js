const { findOneBySlug } = require('@/repositories/AccountRepository');
const { BoxChat } = require('@/models/BoxChat');

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
}

module.exports = new ChatService();
