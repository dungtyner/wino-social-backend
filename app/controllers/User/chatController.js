const chatHandler = require('@/handlers/User/ChatHandler');
class chatController {
  async getListBoxChat(req, res) {
    res.success(await chatHandler.getListBoxChat(req.user));
  }

  async createBoxChat(req, res) {
    const data = await chatHandler.createBoxChat(req.user, req.dto);
    res.success(data);
  }

  async getDetailChat(req, res) {
    const data = await chatHandler.getDetailChat(req.user, req.dto);
    res.success(data);
    // res.send(req.params._id)
  }
  async sendMessage(req, res) {
    await chatHandler.sendMessage(req.params.boxChatId, req.dto);
    res.success({ result: 'OK' });
  }

  async uploadMediaMessage(req, res) {
    res.success(
      await chatHandler.uploadMediaMessage(req.params.boxChatId, req.files),
    );
  }

  async clearNotificationChat(req, res) {
    await chatHandler.clearNotificationChat(req.user, req.dto);
    res.success({ mess: 'OK' });
  }

  async updateInteractMessage(req, res) {
    await chatHandler.updateInteractMessage(req.params.boxChatId, req.dto);
    res.success({ mess: 'OK' });
  }
  async removeSessionMessage(req, res) {
    await chatHandler.removeSessionMessage(req.params.boxChatId, req.dto);
    res.success({ mess: 'OK' });
  }
  async forwardToMessage(req, res) {
    await chatHandler.forwardToMessage(req.user, req.dto);
    res.success({ mess: 'ok' });
  }
  async getMembers(req, res) {
    res.success({
      mess: 'ok',
      result: await chatHandler.getMembers(req.params.boxChatId),
    });
  }
  async removeChat(req, res) {
    await chatHandler.removeChat(req.user, req.params.boxChatId);
    res.success({ mess: 'ok' });
  }
  async updateMemberNickname(req, res) {
    await chatHandler.updateMemberNickname(req.params.boxChatId, req.dto);
    res.success({ mess: 'ok' });
  }
  async search(req, res) {
    res.success({
      mess: 'ok',
      result: await chatHandler.searchBoxChat(req.user, req.dto),
    });
  }
  async modifyNameBoxChat(req, res) {
    await chatHandler.modifyNameBoxChat(req.params.boxChatId, req.dto);
    res.success({ mess: 'ok' });
  }
}

module.exports = new chatController();
