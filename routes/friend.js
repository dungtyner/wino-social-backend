const express = require('express');
const router = express.Router();
const friendController = require('../app/controllers/friendController');
const accountController = require('../app/controllers/accountController');

router.get('/getListFriend', friendController.req_getListFriend);
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

router.post('/requestAddFriend', friendController.requestAddFriend);
router.post(
  '/remove_requestAddFriend',
  friendController.remove_requestAddFriend,
);
router.post(
  '/refuse_requestAddFriend',
  friendController.refuse_requestAddFriend,
);
router.post('/acceptAddNewFriend', friendController.acceptAddNewFriend);
router.post('/unfriend', friendController.unFriend);

module.exports = router;
