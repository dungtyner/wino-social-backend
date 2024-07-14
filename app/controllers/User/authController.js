const UnauthorizedException = require('../../exceptions/UnauthorizedException');
const BaseController = require('./baseController');
const authHandler = require('../../handlers/User/AuthHandler');
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
}
module.exports = new AuthController();
