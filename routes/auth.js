const express = require('express');
const authController = require('../app/controllers/User/AuthController');
const asyncHandler = require('../app/utils/asyncHandler');
const validateDto = require('../app/middlewares/validateDTO');
const SignInDTO = require('../app/DTO/User/Auth/SignInDTO');
const SignUpDTO = require('../app/DTO/User/Auth/SignUpDTO');
const RestorePasswordDto = require('../app/DTO/User/Auth/RestorePasswordDTO');

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
