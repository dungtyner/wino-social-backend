const { body } = require('express-validator');

const ForwardToMessageDto = [
  body('boxChatIdFrom').isString(),
  body('boxChatIdTo').isString(),
  body('sessionMessageIndex').isString(),
];

module.exports = ForwardToMessageDto;
