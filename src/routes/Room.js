const express = require("express");
const controller = require("./../controllers/Room");
const validate = require("./../middlewares/validate");
const passport = require("passport");
const isAdmin = require("./../middlewares/isAdmin");
const uploader = require("./../middlewares/uploader");
const {
  roomValidateSchema,
  updateRoomValidateSchema,
} = require("./../validations/room");

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

router
  .route("/:id")
  .get(controller.getRoom)
  .put(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    validate(updateRoomValidateSchema),
    controller.updateRoom
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.deleteRoom
  );

router
  .route("/:id/images")
  .post(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    uploader("images", true),
    controller.addImage
  )
  .get(controller.getRoomImages);

router
  .route("/images/:imageId")
  .delete(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.deleteRoomImage
  );

module.exports = router;
