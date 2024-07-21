const { body } = require('express-validator');

const UpdateInteractMessageDto = [
  body('sessionMessageIndex').isString(),
  body('isNotification').isBoolean(),
  body('sessionMessageValue').isObject(),
];

module.exports = UpdateInteractMessageDto;
