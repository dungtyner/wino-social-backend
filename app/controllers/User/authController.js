const UnauthorizedException = require('@/exceptions/UnauthorizedException');
const BaseController = require('./baseController');
const authHandler = require('@/handlers/User/AuthHandler');
require('dotenv').config();
global.listSocketOnline = [];

class AuthController extends BaseController {
  async signIn(req, res) {
    const account = await authHandler.signIn(req.dto);

    if (account == null) {
      throw new UnauthorizedException('authentication_failed');
    }

    req.session.user = { id: account._id };
    res.success(null, 200, 'sign in success');
  }
  signUp(req, res) {
    authHandler.signUp(req.dto);
    res.success(null, 200, 'sign up success');
  }

  async restorePassword(req, res) {
    const optCode = await authHandler.restorePassword(req.dto);

    if (optCode) {
      req.session.codeEmail = optCode;
    }

    res.success({ status: optCode ? 'ok' : 'failed' }, 200);
  }

  checkCodeEmail() {
    // if (AccountController.User) {
    //   if (accountController.User.code == AccountController.User.code) {
    //     Account.updateOne(
    //       { email: AccountController.User.email },
    //       { password: AccountController.User.newPassword },
    //     )
    //       .then(() => {
    //         console.log('Restore Password Success');
    //       })
    //       .catch(() => {
    //         console.log('Restore Password Fail');
    //       });
    //   }
    // }
  }
}
module.exports = new AuthController();
