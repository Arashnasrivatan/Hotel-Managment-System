const express = require("express");
const controller = require("./../controllers/AiChat");
const validate = require("./../middlewares/validate");
const passport = require("passport");
const isAdmin = require("./../middlewares/isAdmin");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getAiChat
  )
  .post(
    passport.authenticate("accessToken", { session: false }),
    controller.chat
  );

router
  .route("/history")
  .get(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.getAiChats
  );
router
  .route("/history/:id")
  .delete(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.deleteAiChat
  );

module.exports = router;
