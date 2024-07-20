const chatHandler = require('../../handlers/User/ChatHandler');
const { BoxChat } = require('../../models/BoxChat');
const {
  findOneById,
  findOneBySlug,
} = require('../../repositories/AccountRepository');
const DriveController = require('./driveController');

const mongoose = require('mongoose');

class chatController {
  async getListBoxChat(req, res) {
    res.success(await chatHandler.getListBoxChat(req.user));
  }

  async getDetailChat(req, res) {
    const data = await chatHandler.getDetailChat(req.user, req.dto);
    res.success(data);
    // res.send(req.params._id)
  }
  async addMessage({ idChat, value_content_sessionMessage }) {
    console.log(value_content_sessionMessage);
    BoxChat.findOne({ _id: idChat }).then(async (data) => {
      value_content_sessionMessage.id_content_message =
        new mongoose.Types.ObjectId();
      data.content_messages = data.content_messages.concat(
        value_content_sessionMessage,
      );
      data.members = Promise.all(
        await data.members.map(async (member) => {
          // console.log(member.slug_member,value_content_sessionMessage.slug_sender);
          if (member.slug_member != value_content_sessionMessage.slug_sender) {
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
      data.members[0].then((update_members) => {
        data.members = update_members;
        data.last_interact = null;
        data.save();
      });
    });

    var account = await findOneBySlug(value_content_sessionMessage.slug_sender);
    var nsp_chat = global.io.of('/chat');
    await nsp_chat.to(`CHAT_${idChat}`).emit(`PEOPLE_${idChat}_SENDING`, {
      account,
      value_content_sessionMessage,
    });
    await nsp_chat.to(`CHAT_${idChat}`).emit(`PEOPLE_SENDING`, {
      id_Chat: idChat,
      slug_sender: account.slug_personal,
      time_send:
        value_content_sessionMessage.session_messages[
          value_content_sessionMessage.session_messages.length - 1
        ].time_send,
    });
  }
  async request_saveMessage(req, res) {
    // console.log();

    const value_content_sessionMessage = JSON.parse(
      req.body.value_content_sessionMessage,
    );

    // if (false) {
      // const path = `API_SocialMusic/message/${req.body.idChat}`;
    //   DriveController.searchFolderWithPath(path)
    //     .then((data) => data)
    //     .then(async (result) => {
    //       if (!result) {
    //         // var folder_parent= await DriveController.searchFolderWithPath('API_SocialMusic/message')
    //         // console.log(folder_parent);
    //         var folder_parent = await DriveController.searchFolderWithPath(
    //           'API_SocialMusic/message',
    //         );

    //         result = await DriveController.createFolder({
    //           name: req.body.idChat,
    //           idFolderParent: folder_parent.id,
    //         });
    //       }
    //       const stream = require('stream');
    //       var listURLFile = await Promise.all(
    //         req.files.map(async (file) => {
    //           file.originalname = Buffer.from(
    //             file.originalname,
    //             'latin1',
    //           ).toString('utf8');
    //           var bufferStream = stream.PassThrough();
    //           bufferStream.end(file.buffer);
    //           return await DriveController.uploadFile({
    //             bufferStream: bufferStream,
    //             idFolderParent: [result.id],
    //             name: file.originalname,
    //             mineType: file.mimetype,
    //           });
    //         }),
    //       );

    //       var data_files = listURLFile;
    //       if (data_files.length > 0) {
    //         data_files.forEach((data_file, idx) => {
    //           console.log(data_file);
    //           switch (data_file.mimeType.split('/')[0]) {
    //             case 'image':
    //               value_content_sessionMessage.session_messages.forEach(
    //                 (session_message) => {
    //                   if (session_message.image != null) {
    //                     session_message.image = `https://drive.google.com/uc?export=view&id=${data_file.id}`;
    //                     // console.log(session_message.image);
    //                   }
    //                 },
    //               );
    //               break;
    //             case 'video':
    //               value_content_sessionMessage.session_messages.forEach(
    //                 (session_message) => {
    //                   if (session_message.video != null) {
    //                     session_message.video = `https://drive.google.com/uc?export=view&id=${data_file.id}`;
    //                     // console.log(session_message.video);
    //                   }
    //                 },
    //               );
    //               break;

    //             case 'audio':
    //               value_content_sessionMessage.session_messages.forEach(
    //                 (session_message) => {
    //                   if (session_message.audio != null) {
    //                     session_message.audio = `https://drive.google.com/uc?export=view&id=${data_file.id}`;
    //                     // console.log(session_message.audio);
    //                   }
    //                 },
    //               );
    //               break;
    //             case 'application':
    //               value_content_sessionMessage.session_messages.forEach(
    //                 (session_message) => {
    //                   if (session_message.application != null) {
    //                     session_message.application = {
    //                       urlFile: `https://drive.google.com/uc?export=view&id=${data_file.id}`,
    //                       nameFile: data_file.name,
    //                       size: req.files[idx].size,
    //                     };
    //                     // console.log(session_message.application);
    //                   }
    //                 },
    //               );
    //               break;
    //             default:
    //               break;
    //           }
    //         });
    //       }
    //     });
    // }

    new chatController().addMessage({
      idChat: req.body.idChat,
      value_content_sessionMessage,
    });

    res.send({ result: 'OK' });
  }
  listSockChat = new Set();
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
  async request_clearNotificationChat(req, res) {
    var dataAccount = await findOneById(req.session.loginEd);
    //  console.log(dataAccount);
    var list_id_box_chat = JSON.parse(req.query.listNotification);
    list_id_box_chat.forEach(async (box_chat) => {
      var dataBoxChat = await BoxChat.findOne({ _id: box_chat });
      dataBoxChat.members = Promise.all(
        await dataBoxChat.members.map(async (member) => {
          if (member.slug_member == dataAccount.slug_personal) {
            member.notification = false;
          }
          return member;
        }),
      );
      // console.log(dataBoxChat.members);
      dataBoxChat.members[0].then((updateMembers) => {
        dataBoxChat.members = updateMembers;
        dataBoxChat.save();
      });
    });
    res.send({ mess: 'OK' });
  }

  request_updateInteractMess(req, res) {
    console.log('request_updateInteractMess()', req.body);
    var data_body_req = req.body;
    new chatController().updateInteractMess({
      idChat: data_body_req.IdChat,
      idx_sessionMessage: data_body_req.idx_sessionMessage,
      value_sessionMessage: data_body_req.value_sessionMessage,
      socket: data_body_req.socket,
      isNotification: data_body_req.isNotification,
    });
    res.send({ mess: 'OK' });
  }
  async updateInteractMess({
    idChat,
    value_sessionMessage,
    idx_sessionMessage,
    socket,
    isNotification,
  }) {
    console.log('updateInteractMess() running');
    console.log(idChat);

    var boxChat = await BoxChat.findOne({ _id: idChat });
    var idx_content_message = idx_sessionMessage.split('/')[0];
    var idx_sessionMessageUpdate = idx_sessionMessage.split('/')[1];
    console.log(boxChat._id);
    boxChat.content_messages[idx_content_message].session_messages[
      idx_sessionMessageUpdate
    ] = value_sessionMessage;
    // console.log(boxChat.content_messages[idx_content_message].session_messages[idx_sessionMessageUpdate]);
    boxChat.markModified('content_messages');

    if (isNotification) {
      boxChat.last_interact =
        value_sessionMessage.interact[value_sessionMessage.interact.length - 1];
      boxChat.markModified('last_interact');
    }

    var nsp_chat = global.io.of('/chat');
    await nsp_chat
      .to(`CHAT_${idChat}`)
      .except(socket)
      .emit(`PEOPLE_${idChat}_REACTING`, {
        idChat,
        value_sessionMessage,
        idx_sessionMessage,
      });
    boxChat.save();
  }
  async request_removeSessionMess(req, res) {
    console.log(`RUNNING request_removeInteractMess`);
    var idx_content_message = req.body.idx_sessionMessage.split('/')[0];
    var idx_sessionMessageUpdate = req.body.idx_sessionMessage.split('/')[1];
    var box_chat = await BoxChat.findOne({ _id: req.body.idChat });
    var tmp_session_mess =
      box_chat.content_messages[idx_content_message].session_messages[
        idx_sessionMessageUpdate
      ];
    if (!tmp_session_mess.isShare) {
      var files = new chatController().filterMessFile(tmp_session_mess);
      files.forEach(async (file) => {
        console.log(file.type);
        if (file.type != 'application') {
          var id_file = file.value.substring(
            'https://drive.google.com/uc?export=view&id='.length,
            file.value.length,
          );
          var res = await DriveController.deleteFile({
            fileID: id_file,
          });
        } else {
          id_file = file.value.urlFile.substring(
            'https://drive.google.com/uc?export=view&id='.length,
            file.value.urlFile.length,
          );
          res = await DriveController.deleteFile({
            fileID: id_file,
          });
          console.log(res);
        }
      });
    }

    box_chat.content_messages[idx_content_message].session_messages[
      idx_sessionMessageUpdate
    ] = null;
    box_chat.content_messages[idx_content_message].session_messages[
      idx_sessionMessageUpdate
    ] = { time_send: tmp_session_mess.time_send };
    box_chat.content_messages.forEach((content_message) => {
      content_message.session_messages.forEach((session_message) => {
        if (session_message != null) {
          if (session_message.reply != null) {
            if (
              session_message.reply.slug_sender == req.body.slug_sender &&
              session_message.reply.sessionMessage.time_send ==
                tmp_session_mess.time_send
            )
              session_message.reply = null;
          }
        }
      });
    });
    box_chat.markModified('content_messages');
    box_chat.save();
    var nsp_chat = global.io.of('/chat');
    await nsp_chat
      .to(`CHAT_${req.body.idChat}`)
      .emit(`PEOPLE_${req.body.idChat}_REMOVING`, {
        idx_sessionMessage: req.body.idx_sessionMessage,
        slug_sender: req.body.slug_sender,
        idChat: req.body.idChat,
      });

    res.send({ mess: 'OK' });
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
  async request_shareMessage(req, res) {
    console.log('RUNNING request_shareMessage');
    console.log(req.body);
    var idx_content_message = req.body.idx_sessionMessage.split('/')[0];
    var idx_sessionMessageUpdate = req.body.idx_sessionMessage.split('/')[1];
    var box_chat_src = await BoxChat.findOne({ _id: req.body.idChat_src });
    var tmp_session_mess =
      box_chat_src.content_messages[idx_content_message].session_messages[
        idx_sessionMessageUpdate
      ];
    tmp_session_mess.time_send = new Date().toISOString();
    tmp_session_mess.isShare = true;
    tmp_session_mess.interact = [];
    tmp_session_mess.reply = null;
    var account = await findOneById(req.session.loginEd);
    console.log({
      session_messages: [tmp_session_mess],
      slug_sender: account.slug_personal,
    });
    new chatController().addMessage({
      idChat: req.body.idChat_send,
      value_content_sessionMessage: {
        session_messages: [tmp_session_mess],
        slug_sender: account.slug_personal,
      },
    });
    box_chat_src.content_messages[idx_content_message].session_messages[
      idx_sessionMessageUpdate
    ].isShare = true;
    box_chat_src.markModified('content_messages');
    box_chat_src.save();
    res.send({ mess: 'ok' });
  }
  async request_getMembers(req, res) {
    console.log('request_getMembers() running');
    var idChat = req.body.idChat;
    var dataChat = await BoxChat.findOne({ _id: idChat });
    var members = dataChat.members;
    var list_member = await Promise.all(
      members.map(async (member) => {
        var tmp_member = await findOneBySlug(member.slug_member);
        member.detail = tmp_member;
        return member;
      }),
    );
    res.send({ mess: 'ok', result: list_member });
  }
  async request_removeChat(req, res) {
    console.log('request_removeChat() running');
    var box_chat = await BoxChat.findOne({ _id: req.body.idChat });
    var data_account = await findOneById(req.session.loginEd);

    box_chat.members.forEach((member, idx) => {
      if (member.slug_member == data_account.slug_personal) {
        box_chat.members[idx].startContent =
          box_chat.content_messages.length - 1;
      }
    });
    // console.log(box_chat.members);
    box_chat.markModified('members');
    await box_chat.save();
    res.send({ mess: 'ok' });
  }
  async request_updateNickname(req, res) {
    console.log('request_updateNickname() running');
    var box_chat = await BoxChat.findOne({ _id: req.body.idChat });
    box_chat.members.forEach((member) => {
      if (member.slug_member == req.body.slug_member) {
        member.nick_name = req.body.new_nickname;
        console.log(member);
      }
    });
    box_chat.markModified('members');
    box_chat.save();
    res.send({ mess: 'ok' });
  }
  async request_search(req, res) {
    console.log('request_search() running ');
    var data_account = await findOneById(req.session.loginEd);

    var data_box_chats = await Promise.all(
      data_account.list_id_box_chat.map(async (id_box_chat) => {
        // console.log(id_box_chat);
        return chatHandler.getShortChat(
          await BoxChat.findOne({ _id: id_box_chat }),
          req.session.loginEd,
        );
      }),
    );
    // data_box_chats.filter(data_box_chat=>data_box_chat.name_chat.indexOf(req.query.keyword))
    data_box_chats = data_box_chats.filter((data_box_chat) => {
      // ''.toLocaleLowerCase
      return (
        data_box_chat.nameChat
          .toLocaleLowerCase()
          .indexOf(req.query.keyword.toLocaleLowerCase()) > -1
      );
    });
    // console.log(data_box_chats.length);
    res.send({ mess: 'ok', result: data_box_chats });
  }
  async request_modifyNameChat(req, res) {
    console.log('request_modifyNameChat() running');
    var box_chat = await BoxChat.findOne({ _id: req.body.idChat });
    box_chat.name_chat = req.body.nameChat;
    box_chat.markModified('name_chat'), box_chat.save();
    res.send({ mess: 'ok' });
  }
}

module.exports = new chatController();
