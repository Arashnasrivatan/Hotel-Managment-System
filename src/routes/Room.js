const express = require("express");
const controller = require("./../controllers/Room");
const validate = require("./../middlewares/validate");
const passport = require("passport");
const isAdmin = require("./../middlewares/isAdmin");
const uploader = require("./../middlewares/uploader");
const roomValidateSchema = require("./../validations/room");

const router = express.Router();

router
  .route("/")
  .get(controller.getRooms)
  .post(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    uploader("images", true),
    validate(roomValidateSchema),
    controller.createRoom
  );

module.exports = router;
