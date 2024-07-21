const { body } = require('express-validator');

const ModifyNameBoxChatDto = [
  body('content_message').isObject(),
  body('nameChat').isString(),
];

module.exports = ModifyNameBoxChatDto;
