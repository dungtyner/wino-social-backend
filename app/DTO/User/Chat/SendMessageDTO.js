const { body } = require('express-validator');

const SendMessageDto = [body('message').isObject()];

module.exports = SendMessageDto;
