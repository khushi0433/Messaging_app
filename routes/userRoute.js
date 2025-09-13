const { Router } = require("express");
const passport = require("passport");
const { getUserById } = require("../controllers/userController");

const userRouter = Router();

userRouter.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getUserById
);

module.exports = userRouter;