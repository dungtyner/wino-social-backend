const { body } = require('express-validator');

const RestorePasswordDto = [
  body('email').isEmail().withMessage('invalid_email_format'),
];

module.exports = RestorePasswordDto;
