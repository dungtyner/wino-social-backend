const mongoose = require('mongoose');
const Account = require('@/models/Account');

async function findOneById(_id) {
  var data = await mongoose.model('Account', Account.schema).findOne({ _id });
  return data;
}

async function findOneBySlug(slug_personal) {
  var data = await mongoose
    .model('Account', Account.schema)
    .findOne({ slug_personal });
  return data;
}

module.exports = {
  findOneById,
  findOneBySlug,
};
