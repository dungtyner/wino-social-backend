const express = require('express');
const chatController = require('@/controllers/User/chatController');
const validateDto = require('@/middlewares/validateDTO');
const GetDetailChatDto = require('@/DTO/User/Chat/GetDetailChatDTO');
const SendMessageDto = require('@/DTO/User/Chat/SendMessageDTO');
const ModifyNameBoxChatDto = require('@/DTO/User/Chat/ModifyNameBoxChatDTO');
const SearchBoxChatDto = require('@/DTO/User/Chat/SearchBoxChatDTO');
const ForwardToMessageDto = require('@/DTO/User/Chat/forwardToMessageDTO');
const RemoveSessionMessageDto = require('@/DTO/User/Chat/RemoveSessionMessageDTO');
const UpdateInteractMessageDto = require('@/DTO/User/Chat/UpdateInteractMessageDTO');
const ClearNotificationBoxChatDto = require('@/DTO/User/Chat/ClearNotificationBoxChatDTO');
const UpdateMemberNicknameDto = require('@/DTO/User/Chat/UpdateMemberNicknameDTO');
const CreateChatDto = require('@/DTO/User/Chat/CreateBoxChatDTO');
const router = express.Router();
router.get('/get-list-box-chat', chatController.getListBoxChat);
router.get('/search', validateDto(SearchBoxChatDto), chatController.search);
router.get(
  '/get-detail-chat',
  validateDto(GetDetailChatDto),
  chatController.getDetailChat,
);
router.post(
  '/create-box-chat',
  validateDto(CreateChatDto),
  chatController.createBoxChat,
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
