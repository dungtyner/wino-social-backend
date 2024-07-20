const BaseController = require('./baseController');
const accountHandler = require('../../handlers/User/AccountHandler');
require('dotenv').config();
global.listSocketOnline = [];

class AccountController extends BaseController {
  async checkIsActivated(req, res) {
    res.send(await accountHandler.checkIsActivated(req.user));
  }

  signOut(req, res) {
    accountHandler.signOut(req);
    res.success({ status: 200 }, 200);
  }

  async getlistfriendonline(req) {
    console.log('getlistfriendonline', req.user);
  }
  async getPersonalPageWithSlug(req, res) {
    const personalPage = await accountHandler.getPersonalPageWithSlug(
      req.params.slug_personal,
      req.user,
    );
    res.success(personalPage, 200);
  }

  search = async (req, res) => {
    const accounts = await accountHandler.search(req.dto);
    res.success(accounts, 200);
  };
}
module.exports = new AccountController();
