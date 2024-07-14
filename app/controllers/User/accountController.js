const chatController = require('./chatController');
const BaseController = require('./baseController');
const Account = require('../../models/Account');
const { getCountNotificationChat } = require('../../models/BoxChat');
const BoxChat = require('../../models/BoxChat');
const { default: mongoose } = require('mongoose');
const {
  findOneById,
  findOneBySlug,
} = require('../../repositories/AccountRepository');
require('dotenv').config();
global.listSocketOnline = [];

class AccountController extends BaseController {
  constructor(req, res) {
    super(req, res); // Gọi constructor của lớp cha (BaseController)
  }

  async CheckIsActived(req, res) {
    const account = req.user;

    chatController.load_roomSocket_Chat(account);
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
        new AccountController().loadFriendOnline(account, socket);
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
    res.send(result);
  }
  CheckCodeEmail() {
    console.log(AccountController.User);
    if (AccountController.User) {
      if (AccountController.User.code == AccountController.User.code) {
        Account.updateOne(
          { email: AccountController.User.email },
          { password: AccountController.User.newPassword },
        )
          .then(() => {
            console.log('Restore Password Success');
          })
          .catch(() => {
            console.log('Restore Password Fail');
          });
      }
    }
  }
  RestorePassword(req, res) {
    var nodemailer = require('nodemailer');
    const codeRandom = Math.floor(Math.random() * 100000);
    req.session.codeEmail = codeRandom;
    const textCode = 'Code: ' + codeRandom.toString();

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ilovethubumbi@gmail.com',
        pass: 'mazyvmjthmkrzzcg',
      },
    });
    var mailOptions = {
      from: 'ilovethubumbi@gmail.com',
      to: req.body.email,
      subject: 'Restore Password',
      text: textCode,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        res.send({ status: 'ok' });
        console.log('Email sent: ' + info.response);
      }
    });
  }

  SignOut(req, res) {
    console.log('SignOut() running ....');
    delete req.session.loginEd;
    req.session.destroy();
    console.log(req.session);

    global.io.on('connection', (socket) => {
      socket.on(`I'M_SIGN_OUT`, async (dataAccount) => {
        await socket.disconnect();
        dataAccount.list_slug_friend.forEach(async (slug_friend) => {
          new AccountController().loadFriendOnline(
            await findOneBySlug(slug_friend),
            socket,
          );
        });
      });
    });
    res.send({ status: 200 });
  }

  async getlistfriendonline(req) {
    var account = await findOneById(req.session.loginEd);
    console.log('getlistfriendonline', account);
  }
  async getPersonalPageWithSlug(req, res) {
    var dataAccount_own = await findOneById(req.session.loginEd);
    if (
      dataAccount_own &&
      dataAccount_own.slug_personal !== req.params.slug_personal
    ) {
      var id_chatPersonalPage = null;
      var dataAccount_other = await findOneBySlug(req.params.slug_personal);
      id_chatPersonalPage = await Promise.all(
        dataAccount_own.list_id_box_chat.map(async (id_box_chat) => {
          var box_chat = await chatController.getDetailChat_withID(
            id_box_chat,
            req.session.loginEd,
          );
          if (
            box_chat.members.length == 2 &&
            box_chat.members.some(
              (member) => member.slug_member == dataAccount_other.slug_personal,
            )
          ) {
            console.log('box_chat', box_chat.members);
            id_chatPersonalPage = box_chat._id;
            return id_chatPersonalPage;
          }
        }),
      );
      id_chatPersonalPage = id_chatPersonalPage.filter(
        (id_chatPersonalPage) => typeof id_chatPersonalPage !== 'undefined',
      );
      if (id_chatPersonalPage.length == 0) {
        var new_boxChat = new BoxChat.BoxChat({
          members: [
            {
              slug_member: dataAccount_other?.slug_personal,
              nick_name: null,
              notification: false,
              last_seen_content_message: null,
            },
            {
              slug_member: dataAccount_own?.slug_personal,
              nick_name: null,
              notification: false,
              last_seen_content_message: null,
            },
          ],
          content_messages: [],
          name_chat: null,
          avatar_chat: null,
          last_interact: null,
          _id: new mongoose.Types.ObjectId(),
        });
        new_boxChat.save();
        id_chatPersonalPage = [new_boxChat._id];
        dataAccount_other?.list_id_box_chat?.push(id_chatPersonalPage[0]);
        dataAccount_own?.list_id_box_chat?.push(id_chatPersonalPage[0]);
        dataAccount_own?.markModified('list_id_box_chat');
        dataAccount_other?.markModified('list_id_box_chat');

        dataAccount_other?.save();
        dataAccount_own?.save();
        // global.io.emit(`ACCOUNT_${dataAccount_own.slug_personal}_UPDATE`,dataAccount_own)
      }
      res.send({
        result: dataAccount_other,
        id_chatPersonalPage: id_chatPersonalPage[0],
      });
    } else {
      res.send({ result: dataAccount_own });
    }
  }

  search = async (req, res) => {
    const keyword = req.query.keyword;
    await Account.find().then((account) => {
      const filter_user = account.filter((value) => {
        console.log(value.lname.toUpperCase(), keyword.toUpperCase());
        return (
          (value.fname.toUpperCase() + ' ' + value.lname.toUpperCase()).indexOf(
            keyword.toUpperCase(),
          ) > -1
        );
      });
      console.log('filter_user', filter_user);
      res.json(filter_user);
    });

    // console.log(account);
  };
  // console.log(account);
  loadFriendOnline(account, socket) {
    var list_friend_online = [];

    account.list_slug_friend.forEach((slug_friend) => {
      for (let i = 0; i < global.listSocketOnline.length; i++) {
        const element = global.listSocketOnline[i];
        if (element.account.slug_personal == slug_friend) {
          console.log(global.listSocketOnline.length);
          // if(!list_friend_online.some(el=>el.slug_personal==slug_friend))
          list_friend_online.push(element.account);
          break;
        }
      }
    });
    if (socket) {
      global.io
        .to(socket.id)
        .emit(
          `LIST_FRIEND_ONLINE_OF_${account.slug_personal}`,
          list_friend_online,
        );
    } else {
      global.io.emit(
        `LIST_FRIEND_ONLINE_OF_${account.slug_personal}`,
        list_friend_online,
      );
    }
  }
}
module.exports = new AccountController();
