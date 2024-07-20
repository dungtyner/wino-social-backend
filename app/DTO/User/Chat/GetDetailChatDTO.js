const { query } = require('express-validator');

const GetDetailChatDto = [query('is_seen'), query('_id')];

module.exports = GetDetailChatDto;
