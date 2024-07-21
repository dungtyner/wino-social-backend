const { body } = require('express-validator');

const RemoveSessionMessageDto = [
  body('sessionMessageIndex').isString(),
  body('slugSender').isString(),
];

module.exports = RemoveSessionMessageDto;
