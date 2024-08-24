const driveStorageService = require('../../services/DriveStorageService');
const Account = require('../../models/Account');
const { BoxChat, Chat } = require('../../models/BoxChat');
const {
  findOneById,
  findOneBySlug,
} = require('../../repositories/AccountRepository');
const chatService = require('../../services/ChatService');
const mongoose = require('mongoose');
const socketClient = require('../../clients/socketClient');

class ChatHandler {
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
      shortChat: await this.getShortChat(result, user.id),
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
      tmpBoxChat.nameChat = box_chat.name_chat ?? 'anomyus';
      tmpBoxChat.avatarChat = box_chat.avatar_chat;
    }

    return tmpBoxChat;
  }

  async sendMessage(boxChatId, dto) {
    const message = dto.message;

    return await this.addMessage({
      idChat: boxChatId,
      message,
    });
  }

  async uploadMediaMessage(boxChatId, files = null) {
    if (files && files.length > 0) {
      const path = `API_SocialMusic/message/${boxChatId}`;
      return await driveStorageService
        .searchFolderWithPath(path)
        .then((data) => data)
        .then(async (result) => {
          if (!result) {
            // var folder_parent= await DriveStorageService.searchFolderWithPath('API_SocialMusic/message')
            var folder_parent = await driveStorageService.searchFolderWithPath(
              'API_SocialMusic/message',
            );

            result = await driveStorageService.createFolder({
              name: boxChatId,
              idFolderParent: folder_parent.id,
            });
          }
          const stream = require('stream');
          var listURLFile = await Promise.all(
            files.map(async (file) => {
              file.originalname = Buffer.from(
                file.originalname,
                'latin1',
              ).toString('utf8');
              var bufferStream = stream.PassThrough();
              bufferStream.end(file.buffer);
              return await driveStorageService.uploadFile({
                bufferStream: bufferStream,
                idFolderParent: [result.id],
                name: file.originalname,
                mineType: file.mimetype,
              });
            }),
          );

          const data_files = listURLFile;
          if (data_files.length > 0) {
            return data_files.map((data_file, idx) => {
              switch (data_file.mimeType.split('/')[0]) {
                case 'image':
                  return {
                    image: `https://drive.google.com/uc?export=view&id=${data_file.id}`,
                  };
                case 'video':
                  return {
                    video: `https://drive.google.com/uc?export=view&id=${data_file.id}`,
                  };

                case 'audio':
                  return {
                    audio: `https://drive.google.com/uc?export=view&id=${data_file.id}`,
                  };
                case 'application':
                  return {
                    application: {
                      urlFile: `https://drive.google.com/uc?export=view&id=${data_file.id}`,
                      nameFile: data_file.name,
                      size: files[idx].size,
                    },
                  };
                default:
                  break;
              }
            });
          }
        });
    }
  }

  async addMessage({ idChat, message }) {
    BoxChat.findOne({ _id: idChat }).then(async (data) => {
      message.id_content_message = new mongoose.Types.ObjectId();
      data.content_messages = data.content_messages.concat(message);
      data.members = await Promise.all(
        await data.members.map(async (member) => {
          if (member.slug_member != message.slug_sender) {
            member.notification = true;
            return member;
          } else {
            member.last_seen_content_message = `${
              data.content_messages.length - 1
            }`;
            member.notification = false;
            return member;
          }
        }),
      );

      data.save();
    });

    const account = await findOneBySlug(message.slug_sender);

    socketClient.post('/event/chat/add-message', {
      account,
      idChat,
      message,
    });
  }

  async modifyNameBoxChat(boxChatId, dto) {
    var boxChat = await BoxChat.findOne({ _id: boxChatId });
    boxChat.name_chat = dto.nameChat;
    boxChat.markModified('name_chat'), boxChat.save();
  }

  async searchBoxChat(user, dto) {
    const boxChats = await Promise.all(
      user.list_id_box_chat.map(async (boxChatId) => {
        return this.getShortChat(
          await BoxChat.findOne({ _id: boxChatId }),
          user.id,
        );
      }),
    );

    return boxChats.filter((boxChat) => {
      return (
        boxChat.nameChat
          .toLocaleLowerCase()
          .indexOf(dto.keyword.toLocaleLowerCase()) > -1
      );
    });
  }

  async forwardToMessage(user, dto) {
    var contentMessageIndex = dto.sessionMessageIndex.split('/')[0];
    var sessionMessageIndex = dto.sessionMessageIndex.split('/')[1];
    var boxChatFrom = await BoxChat.findOne({ _id: dto.boxChatIdFrom });
    var newSessionMessage =
      boxChatFrom.content_messages[contentMessageIndex].session_messages[
        sessionMessageIndex
      ];
    newSessionMessage.time_send = new Date().toISOString();
    newSessionMessage.isShare = true;
    newSessionMessage.interact = [];
    newSessionMessage.reply = null;

    this.addMessage({
      idChat: dto.boxChatIdTo,
      message: {
        session_messages: [newSessionMessage],
        slug_sender: user.slug_personal,
      },
    });

    boxChatFrom.content_messages[contentMessageIndex].session_messages[
      sessionMessageIndex
    ].isShare = true;

    boxChatFrom.markModified('content_messages');
    boxChatFrom.save();
  }

  async removeSessionMessage(boxChatId, dto) {
    var contentMessageIndex = dto.sessionMessageIndex.split('/')[0];
    var sessionMessageIndex = dto.sessionMessageIndex.split('/')[1];
    var boxChat = await BoxChat.findOne({ _id: boxChatId });
    var tempSessionMess =
      boxChat.content_messages[contentMessageIndex].session_messages[
        sessionMessageIndex
      ];
    if (!tempSessionMess.isShare) {
      var files = this.filterMessFile(tempSessionMess);
      files.forEach(async (file) => {
        if (file.type != 'application') {
          var id_file = file.value.substring(
            'https://drive.google.com/uc?export=view&id='.length,
            file.value.length,
          );
          await driveStorageService.deleteFile({
            fileID: id_file,
          });
        } else {
          id_file = file.value.urlFile.substring(
            'https://drive.google.com/uc?export=view&id='.length,
            file.value.urlFile.length,
          );
          await driveStorageService.deleteFile({
            fileID: id_file,
          });
        }
      });
    }

    boxChat.content_messages[contentMessageIndex].session_messages[
      sessionMessageIndex
    ] = null;
    boxChat.content_messages[contentMessageIndex].session_messages[
      sessionMessageIndex
    ] = { time_send: tempSessionMess.time_send };
    boxChat.content_messages.forEach((content_message) => {
      content_message.session_messages.forEach((sessionMessage) => {
        if (sessionMessage != null) {
          if (sessionMessage.reply != null) {
            if (
              sessionMessage.reply.slug_sender == dto.slugSender &&
              sessionMessage.reply.sessionMessage.time_send ==
                tempSessionMess.time_send
            )
              sessionMessage.reply = null;
          }
        }
      });
    });
    boxChat.markModified('content_messages');
    boxChat.save();
    const nsp_chat = global.io.of('/chat');
    await nsp_chat
      .to(`CHAT_${boxChatId}`)
      .emit(`PEOPLE_${dto.boxChatId}_REMOVING`, {
        idx_sessionMessage: dto.sessionMessageIndex,
        slug_sender: dto.slugSender,
        idChat: boxChatId,
      });
  }

  filterMessFile(sessionMess) {
    const typeFiles = ['video', 'image', 'audio', 'video', 'application'];
    var values = Object.values(sessionMess);
    var result = [];
    var keys = Object.keys(sessionMess);
    values.forEach((value, idx) => {
      if (value != null) {
        if (value.length > 0) {
          if (typeFiles.indexOf(keys[idx]) > -1) {
            result.push({ type: keys[idx], value: value });
          }
        } else if (Object.keys(value).length > 0) {
          if (typeFiles.indexOf(keys[idx]) > -1) {
            result.push({ type: keys[idx], value: value });
          }
        }
      }
    });
    return result;
  }

  async updateInteractMessage(boxChatId, dto) {
    await this.updateInteractMess({
      idChat: boxChatId,
      sessionMessageIndex: dto.sessionMessageIndex,
      sessionMessageValue: dto.sessionMessageValue,
      socket: dto.socket,
      isNotification: dto.isNotification,
    });
  }

  async updateInteractMess({
    idChat,
    sessionMessageValue,
    sessionMessageIndex,
    socket,
    isNotification,
  }) {
    const boxChat = await BoxChat.findOne({ _id: idChat });
    const contentMessageIndex = sessionMessageIndex.split('/')[0];
    const sessionMessageIndexUpdate = sessionMessageIndex.split('/')[1];
    boxChat.content_messages[contentMessageIndex].session_messages[
      sessionMessageIndexUpdate
    ] = sessionMessageValue;
    // console.log(boxChat.content_messages[contentMessageIndex].session_messages[sessionMessageIndexUpdate]);
    boxChat.markModified('content_messages');

    if (isNotification) {
      boxChat.last_interact =
        sessionMessageValue.interact[sessionMessageValue.interact.length - 1];
      boxChat.markModified('last_interact');
    }

    var nsp_chat = global.io.of('/chat');
    await nsp_chat
      .to(`CHAT_${idChat}`)
      .except(socket)
      .emit(`PEOPLE_${idChat}_REACTING`, {
        idChat,
        sessionMessageValue,
        sessionMessageIndex,
      });
    boxChat.save();
  }

  async clearNotificationChat(user, dto) {
    var list_id_box_chat = dto.boxChatIds.split(',');
    list_id_box_chat.forEach(async (box_chat) => {
      var dataBoxChat = await BoxChat.findOne({ _id: box_chat });
      dataBoxChat.members = Promise.all(
        await dataBoxChat.members.map(async (member) => {
          if (member.slug_member == user.slug_personal) {
            member.notification = false;
          }
          return member;
        }),
      );

      dataBoxChat.members[0].then((updateMembers) => {
        dataBoxChat.members = updateMembers;
        dataBoxChat.save();
      });
    });
  }

  async getMembers(boxChatId) {
    const dataChat = await BoxChat.findOne({ _id: boxChatId });
    return await Promise.all(
      dataChat.members.map(async (member) => {
        const data = member.toObject();
        data.detail = await member.getDetail();
        return data;
      }),
    );
  }

  async removeChat(user, boxChatId) {
    var boxChat = await BoxChat.findOne({ _id: boxChatId });

    boxChat.members.forEach((member, idx) => {
      if (member.slug_member == user.slug_personal) {
        boxChat.members[idx].startContent = boxChat.content_messages.length - 1;
      }
    });

    boxChat.markModified('members');
    await boxChat.save();
  }

  async updateMemberNickname(boxChatId, dto) {
    var boxChat = await BoxChat.findOne({ _id: boxChatId });
    boxChat.members.forEach((member) => {
      if (member.slug_member == dto.slugMember) {
        member.nick_name = dto.nickname;
      }
    });
    boxChat.markModified('members');
    boxChat.save();
  }

  async createBoxChat(user, dto) {
    const dataAccount = user;

    const box_chat = await BoxChat.findOne({ _id: dto._id });
    box_chat.members = await Promise.all(
      dto.members.map(async (slug) => {
        const member = await findOneBySlug(slug);

        return {
          slug_member: slug,
          nick_name: `${member.fname} ${member.lname}`,
        };
      }),
    );
    box_chat.save();

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
      shortChat: await this.getShortChat(result, user.id),
    };
  }
}

module.exports = new ChatHandler();
