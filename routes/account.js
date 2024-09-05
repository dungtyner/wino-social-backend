const express = require('express');
const accountControllers = require('@/controllers/User/accountController');
const asyncHandler = require('@/utils/asyncHandler');
const validateDto = require('@/middlewares/validateDto');
const SearchAccountDto = require('@/DTO/User/Account/SearchAccountDTO');
const router = express.Router();

router.get(
  '/check-is-active',
  asyncHandler(accountControllers.checkIsActivated),
);
router.get('/sign-out', accountControllers.signOut);
router.get('/getlistfriendonline', accountControllers.getlistfriendonline);
router.get(
  '/search/keyword',
  validateDto(SearchAccountDto),
  accountControllers.search,
);
router.get('/:slug_personal*', accountControllers.getPersonalPageWithSlug);

// router.post("/test",accountControllers.test);
// router.get("/test",accountControllers.test);

module.exports = router;
