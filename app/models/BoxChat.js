const mongoose = require('mongoose');
const { findOneById } = require('../repositories/AccountRepository');
const BoxChat = mongoose.Schema(
  {
    content_messages: { type: Array },
    members: { type: Array },
    name_chat: { type: String },
    avatar_chat: { type: String },
    last_interact: { type: Object },
  },
  { collection: 'box_chats' },
);
module.exports = {
  BoxChat: mongoose.model('BoxChat', BoxChat),
  Chat,
  getCountNotificationChat,
};

function Chat({
  avatarChat = '',
  nameChat = '',
  lastSessionMessage = null,
  isSeen,
} = {}) {
  this.avatarChat = avatarChat;
  this.nameChat = nameChat;
  this.lastSessionMessage = lastSessionMessage;
  this.isSeen = isSeen;
}
async function getCountNotificationChat({ id_account }) {
  console.log('getCountNotificationChat() running');
  var count = [];
  var dataAccount = await findOneById(id_account);
  var tmp_count = await Promise.all(
    dataAccount.list_id_box_chat.map(async (element, idx) => {
      var box_chats = await mongoose
        .model('BoxChat', BoxChat)
        .find({ _id: element });
      box_chats.forEach((box_chat) => {
        box_chat.members.forEach((member) => {
          // console.log(member);
          if (
            member.slug_member == dataAccount.slug_personal &&
            member.notification == true
          ) {
            count.push(box_chat._id);
            // console.log(`COUNT: ${count}`);
          }
        });
      });
      if (idx == box_chats.length - 1) {
        // console.log(count);
        return count;
      }
    }),
  );
  if (tmp_count.length == 0) tmp_count.push([]);
  return tmp_count[0];
}
