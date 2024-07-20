const Account = require('../../models/Account');
const { BoxChat, Chat } = require('../../models/BoxChat');
const { findOneById, findOneBySlug } = require('../../repositories/AccountRepository');
const chatService = require('../../services/ChatService');

class ChatController {
  async getListBoxChat(user) {
    const slug_personal = user.slug_personal;
    var listBoxChat = Promise.all(
      user.list_id_box_chat.map(async (boxChat) => {
        var list_box_chat = await BoxChat.find({ _id: boxChat }).select({
          members: 1,
          content_messages: 1,
          _id: 1,
          name_chat: 1,
          avatar_chat: 1,
          last_interact: 1,
        });

        listBoxChat = Promise.all(
          list_box_chat.map(async (box_chat) => {
            return await this.getShortChat(box_chat, user.id);
          }),
        );

        return listBoxChat;
      }),
    );
    return await listBoxChat.then(async (data) => {
      const list_boxChat = [];
      await Promise.all(
        data.map(async (el) => {
          if (el[0].lastSessionMessage) {
            var dataBoxChat = await BoxChat.findOne({ _id: el[0]._id });
            var is = dataBoxChat.members.some((el) => {
              return (
                el.slug_member == slug_personal &&
                el.startContent &&
                el.startContent > 0 &&
                el.startContent == dataBoxChat.content_messages.length - 1
              );
            });
            if (!is) {
              list_boxChat.push(el[0]);
              return el[0];
            }
          }
        }),
      );
      listBoxChat = await listBoxChat;
      list_boxChat.filter((el) => el != null);
      list_boxChat.forEach((box_chat, idx) => {
        if (idx !== 0) {
          var i = idx - 1;
          var tmp = box_chat;
          while (
            i >= 0 &&
            tmp.lastSessionMessage &&
            list_boxChat[i].lastSessionMessage &&
            new Date(list_boxChat[i].lastSessionMessage.time_send).getTime() <
              new Date(tmp.lastSessionMessage.time_send).getTime()
          ) {
            list_boxChat[i + 1] = list_boxChat[i];
            i--;
          }
          list_boxChat[i + 1] = tmp;
        }
      });

      return list_boxChat;
    });
  }

  async getDetailChat(user, dto) {
    const dataAccount = user;
    if (!JSON.parse(dto.is_seen)) {
      const box_chat = await BoxChat.findOne({ _id: dto._id });
      box_chat.members = Promise.all(
        await box_chat.members.map((member) => {
          if (member.slug_member == dataAccount.slug_personal) {
            member.last_seen_content_message =
              box_chat.content_messages.length - 1 + '';
          }
          return member;
        }),
      );
      // console.log(box_chat.members);
      box_chat.members[0].then((update_members) => {
        // console.log(update_members);
        box_chat.members = update_members;
        box_chat.save();
      });
    }
    const result = await chatService.getDetailChatByUserId(dto._id, user.id);
    result.members.forEach((member) => {
      if (
        member.slug_member == dataAccount.slug_personal &&
        member.startContent > 0
      ) {
        result.content_messages = result.content_messages.filter(
          (content_message, idx) => idx > member.startContent,
        );
      }
    });

    return {
      result,
      shortChat: this.getShortChat(result, user.id),
    };
  }

  async getShortChat(box_chat, idAccount) {
    const tmpBoxChat = new Chat();
    var your_slug = [];
    tmpBoxChat.last_interact = box_chat.last_interact;

    const dataAccount = await findOneById(idAccount);

    box_chat.members.forEach((member) => {
      if (member.slug_member == dataAccount.slug_personal) {
        var idx_Content_message = member.last_seen_content_message
          ? parseInt(member.last_seen_content_message.split('/')[0])
          : null;
        if (idx_Content_message) {
          if (idx_Content_message < box_chat.content_messages.length - 1) {
            tmpBoxChat.isSeen = false;
          } else {
            tmpBoxChat.isSeen = true;
          }
        }
      }
    });

    if (box_chat.content_messages.length > 0) {
      const session_messages =
        box_chat.content_messages[box_chat.content_messages.length - 1]
          .session_messages;

      if (session_messages.length > 0) {
        tmpBoxChat.lastSessionMessage =
          session_messages[session_messages.length - 1];
      } else {
        tmpBoxChat.lastSessionMessage = [];
      }

      const dataAccountSender = await findOneBySlug(
        box_chat.content_messages[box_chat.content_messages.length - 1]
          .slug_sender,
      );
      tmpBoxChat.name_sender = dataAccountSender.lname;

      tmpBoxChat.slug_sender =
        box_chat.content_messages[
          box_chat.content_messages.length - 1
        ].slug_sender;
    }

    tmpBoxChat._id = box_chat._id;

    if (box_chat.members.length == 2 && box_chat.name_chat == null) {
      your_slug = box_chat.members.filter((el) => {
        console.log(el);
        return el.slug_member != dataAccount.slug_personal;
      });

      const dataMember = await Account.findOne({
        slug_personal: your_slug[0].slug_member,
      }).select({
        avatar_account: 1,
        fname: 1,
        lname: 1,
      });

      tmpBoxChat.avatarChat = dataMember?.avatar_account;
      if (your_slug[0].nick_name) {
        tmpBoxChat.nameChat = your_slug[0].nick_name;
      } else {
        tmpBoxChat.nameChat = await (dataMember.fname + ' ' + dataMember.lname);
      }
    } else {
      tmpBoxChat.nameChat = box_chat.name_chat;
      tmpBoxChat.avatarChat = box_chat.avatar_chat;
    }
    return tmpBoxChat;
  }
}

module.exports = new ChatController();
