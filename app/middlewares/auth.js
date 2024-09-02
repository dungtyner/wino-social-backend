const UnauthorizedException = require('@/exceptions/UnauthorizedException');
const { findOneById } = require('@/repositories/AccountRepository');

async function isAuthenticated(req, res, next) {
  try {
    if (req.session && req.session.user) {
      const user = await findOneById(req.session.user.id);
      if (user !== null) {
        req.user = user;
        next();
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new UnauthorizedException();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = isAuthenticated;
