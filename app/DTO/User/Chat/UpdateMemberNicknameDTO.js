const { body } = require('express-validator');

const UpdateMemberNicknameDto = [
  body('slugMember').isString(),
  body('nickname').isString(),
];

module.exports = UpdateMemberNicknameDto;
