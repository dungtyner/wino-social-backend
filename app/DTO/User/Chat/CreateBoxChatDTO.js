const { body } = require('express-validator');

const CreateChatDto = [body('members').isArray(), body('_id')];

module.exports = CreateChatDto;
