const { body } = require('express-validator');

const SignInDTO = [
  body('email').isEmail().withMessage('invalid_email_format'),
  body('password')
    .isLength({ min: 5, max: 128 })
    .withMessage('password_length_between_5_and_128_characters'),
  body('recaptcha_token').notEmpty().withMessage('recaptcha_token_required'),
];

module.exports = SignInDTO;
