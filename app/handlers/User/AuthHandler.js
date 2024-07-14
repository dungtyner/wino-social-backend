const InternalServerException = require('../../exceptions/InternalServerException');
const UnauthorizedException = require('../../exceptions/UnauthorizedException');
const Account = require('../../models/Account');
require('dotenv').config();
global.listSocketOnline = [];

class AuthHandler {
  async signIn(dto) {
    var recaptcha_token = dto.recaptcha_token;
    var key_secret = process.env.RECAPTCHA_SECRET_KEY;
    const url_Captcha = `https://www.google.com/recaptcha/api/siteverify?secret=${key_secret}&response=${recaptcha_token}`;
    const response = await fetch(url_Captcha, { method: 'POST' });
    const google_response = await response.json();

    if (!google_response.success) {
      throw new UnauthorizedException('recaptcha_invalid');
    }

    const account = await Account.findOne(dto);
    return account;
  }
  signUp(dto) {
    new Date().toISOString();
    var slug_personal = (dto.fname + '.' + dto.lname + new Date().toJSON())
      .replaceAll(' ', '')
      .replaceAll(':', '')
      .replaceAll('-', '')
      .toLowerCase();
    dto.slug_personal = slug_personal;
    Account.create(dto).catch((error) => {
      throw new InternalServerException(error.message);
    });
  }
}
module.exports = new AuthHandler();
