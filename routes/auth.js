const express = require('express');
const authController = require('@/controllers/User/AuthController');
const asyncHandler = require('@/utils/asyncHandler');
const validateDto = require('@/middlewares/validateDTO');
const SignInDTO = require('@/DTO/User/Auth/SignInDTO');
const SignUpDTO = require('@/DTO/User/Auth/SignUpDTO');
const RestorePasswordDto = require('@/DTO/User/Auth/RestorePasswordDTO');

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

router.post(
  '/restore-pass',
  validateDto(RestorePasswordDto),
  asyncHandler(authController.restorePassword),
);
router.post('/check-code-email', authController.checkCodeEmail);
module.exports = router;
