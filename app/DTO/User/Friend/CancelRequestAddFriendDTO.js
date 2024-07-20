const { body } = require('express-validator');

const CancelRequestAddFriendDto = [body('slug_friend').notEmpty()];

module.exports = CancelRequestAddFriendDto;
