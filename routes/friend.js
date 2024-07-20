const express = require('express');
const router = express.Router();
const friendController = require('../app/controllers/User/friendController');
const accountController = require('../app/controllers/User/AccountController');
const validateDto = require('../app/middlewares/validateDTO');
const AddFriendDto = require('../app/DTO/User/Friend/AddFriendDTO');
const CancelRequestAddFriendDto = require('../app/DTO/User/Friend/CancelRequestAddFriendDTO');

router.get('/get-list-friend', friendController.getListFriend);
router.get('/getListRequestFriend', friendController.req_getListRequestFriend);
router.get(
  '/getListResponseFriend',
  friendController.req_getListResponseFriend,
);

router.get('/list/:slug_personal*', accountController.getPersonalPageWithSlug);
router.get(
  '/request/:slug_personal*',
  accountController.getPersonalPageWithSlug,
);
router.get(
  '/response/:slug_personal*',
  accountController.getPersonalPageWithSlug,
);

router.post(
  '/request-add-friend',
  validateDto(AddFriendDto),
  friendController.requestAddFriend,
);
router.post(
  '/cancel-request-add-friend',
  validateDto(CancelRequestAddFriendDto),
  friendController.cancelRequestAddFriend,
);
router.post(
  '/refuse_requestAddFriend',
  friendController.refuse_requestAddFriend,
);
router.post('/acceptAddNewFriend', friendController.acceptAddNewFriend);
router.post('/unfriend', friendController.unFriend);

module.exports = router;
