const { query } = require('express-validator');

const SearchAccountDto = [query('keyword')];

module.exports = SearchAccountDto;
