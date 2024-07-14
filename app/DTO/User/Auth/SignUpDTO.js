const { body } = require('express-validator');

const SignUpDTO = [
  body('email').isEmail().withMessage('invalid_email_format'),
  body('password').isLength({ min: 6 }).withMessage('password_min_length_6'),
  body('fname')
    .isString()
    .notEmpty()
    .withMessage('first_name_required_and_must_be_a_string'),
  body('lname')
    .isString()
    .notEmpty()
    .withMessage('last_name_required_and_must_be_a_string'),
  body('birthday')
    .isISO8601()
    .toDate()
    .withMessage('invalid_date_format_use_iso8601_format_yyyy_mm_dd'),
  body('gender').isIn(['0', '1']).withMessage('gender_must_be_either_0_or_1'),
];

module.exports = SignUpDTO;
