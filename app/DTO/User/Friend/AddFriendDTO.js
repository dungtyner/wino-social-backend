const { body } = require('express-validator');

const AddFriendDto = [body('slug_friend').notEmpty()];

module.exports = AddFriendDto;
