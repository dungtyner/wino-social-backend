const { query } = require('express-validator');

const SearchBoxChatDto = [query('keyword')];

module.exports = SearchBoxChatDto;
