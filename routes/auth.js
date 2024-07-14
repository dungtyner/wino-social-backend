const express = require('express');
const authController = require('../app/controllers/User/authController');
const asyncHandler = require('../app/utils/asyncHandler');
const validateDto = require('../app/middlewares/validateDTO');
const SignInDTO = require('../app/DTO/User/Auth/SignInDTO');
const SignUpDTO = require('../app/DTO/User/Auth/SignUpDTO');
const router = express.Router();

router.post(
  '/sign-in',
  validateDto(SignInDTO),
  asyncHandler(authController.signIn),
);
router.post(
  '/sign-up',
  validateDto(SignUpDTO),
  asyncHandler(authController.signUp),
);

module.exports = router;
