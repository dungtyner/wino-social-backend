const mongoose = require('mongoose');
const Account = mongoose.Schema(
  {
    user_fname: { type: String, required: true },
    user_lname: { type: String, required: true },
    gmail: { type: String, required: true, unique: true },
    gender: { type: Boolean, required: false, default: false },
    birthday: { type: Date, required: true },
    password: { type: String, required: true },
    avatar_account: {
      type: String,
      required: false,
      default:
        'https://drive.google.com/uc?export=view&id=1ONQ1Mdw14u4gMRyHZSd37cbmfSH-UYlX',
    },
    cover_image: {
      type: String,
      required: false,
      default:
        'https://drive.google.com/uc?export=view&id=1VPH0o0V7iK07TWE4mQwOwcdzOVPYvjxd',
    },
    slug_personal: { type: String, required: false },
    list_id_box_chat: { type: Array, required: false, default: [] },
    list_slug_friend: { type: Array, required: false, default: [] },
    count_notification_chat: { type: Array },
    count_notification: { type: Number },
    notification: {
      type: Object,
      default: {
        friend: {
          response_new_friend: [],
          accept_friend: [],
        },
      },
    },
    list_response_new_friend: { type: Array },
    list_request_new_friend: { type: Array },
  },
  {
    versionKey: false, // You should be aware of the outcome after set to false
  },
);
async function getDataAccount_byID(_id) {
  var data = await mongoose.model('Account', Account).findOne({ _id });
  return data;
}
async function getDataAccount_bySlug(slug_personal) {
  var data = await mongoose
    .model('Account', Account)
    .findOne({ slug_personal });
  return data;
}
module.exports = {
  Account: mongoose.model('Account', Account),
  getDataAccount_byID,
  getDataAccount_bySlug,
};
