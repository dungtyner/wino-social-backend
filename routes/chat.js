const express = require('express');
const chatController = require('../app/controllers/User/chatController');
const validateDto = require('../app/middlewares/validateDTO');
const GetDetailChatDto = require('../app/DTO/User/Chat/GetDetailChatDTO');
const SendMessageDto = require('../app/DTO/User/Chat/SendMessageDTO');
const ModifyNameBoxChatDto = require('../app/DTO/User/Chat/ModifyNameBoxChatDTO');
const SearchBoxChatDto = require('../app/DTO/User/Chat/SearchBoxChatDTO');
const ForwardToMessageDto = require('../app/DTO/User/Chat/forwardToMessageDTO');
const RemoveSessionMessageDto = require('../app/DTO/User/Chat/RemoveSessionMessageDTO');
const UpdateInteractMessageDto = require('../app/DTO/User/Chat/UpdateInteractMessageDTO');
const ClearNotificationBoxChatDto = require('../app/DTO/User/Chat/ClearNotificationBoxChatDTO');
const UpdateMemberNicknameDto = require('../app/DTO/User/Chat/UpdateMemberNicknameDTO');
const router = express.Router();
router.get('/get-list-box-chat', chatController.getListBoxChat);
router.get('/search', validateDto(SearchBoxChatDto), chatController.search);
router.get(
  '/get-detail-chat',
  validateDto(GetDetailChatDto),
  chatController.getDetailChat,
);
router.post(
  '/:boxChatId/upload-media-message',
  global.uploads.array('listFile'),
  chatController.uploadMediaMessage,
);
router.post(
  '/:boxChatId/send-message',
  validateDto(SendMessageDto),
  chatController.sendMessage,
);
router.post(
  '/:boxChatId/update-interact-message',
  validateDto(UpdateInteractMessageDto),
  chatController.updateInteractMessage,
);
router.post(
  '/forward-to-message',
  validateDto(ForwardToMessageDto),
  chatController.forwardToMessage,
);
router.post(
  '/:boxChatId/remove-session-message',
  validateDto(RemoveSessionMessageDto),
  chatController.removeSessionMessage,
);
router.get(
  '/clear-notification-box-chat',
  validateDto(ClearNotificationBoxChatDto),
  chatController.clearNotificationChat,
);
router.post('/:boxChatId/get-members', chatController.getMembers);
router.post(
  '/:boxChatId/member/update-nickname',
  validateDto(UpdateMemberNicknameDto),
  chatController.updateMemberNickname,
);
router.post(
  '/:boxChatId/modify-name-box-chat',
  validateDto(ModifyNameBoxChatDto),
  chatController.modifyNameBoxChat,
);
router.post('/:boxChatId/remove', chatController.removeChat);

module.exports = router;
