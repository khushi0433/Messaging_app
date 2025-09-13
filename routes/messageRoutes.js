const { Router } = require("express");
const passport = require("passport");
const messageController = require('../controllers/messageController')

const messageRouter = Router();

messageRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  messageController.sendMessage
);

messageRouter.get(
  "/:withUserId",
  passport.authenticate("jwt", { session: false }),
  messageController.getConversation
);

module.exports = messageRouter;