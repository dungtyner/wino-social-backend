const express = require('express');
const chatController = require('../app/controllers/chatController');
const router = express.Router();
router.get('/getListBoxChat', chatController.getListBoxChat);
router.get('/search', chatController.request_search);
router.get('/getDetailChat', chatController.request_getDetailChat);
router.post(
  '/saveMessage',
  global.uploads.array('listFile'),
  chatController.request_saveMessage,
);
router.post('/updateInteractMess', chatController.request_updateInteractMess);
router.post('/shareMessage', chatController.request_shareMessage);
router.post('/removeSessionMess', chatController.request_removeSessionMess);
router.get(
  '/clearNotificationChat',
  chatController.request_clearNotificationChat,
);
router.post('/getMembers', chatController.request_getMembers);
router.post('/updateNickname', chatController.request_updateNickname);
router.post('/modifyNameChat', chatController.request_modifyNameChat);

router.post('/removeChat', chatController.request_removeChat);

module.exports = router;
