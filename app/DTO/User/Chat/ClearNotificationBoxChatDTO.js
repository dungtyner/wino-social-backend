const { query } = require('express-validator');

const ClearNotificationBoxChatDto = [query('boxChatIds')];
module.exports = ClearNotificationBoxChatDto;
