const express = require("express");
const controller = require("./../controllers/User");
const validate = require("./../middlewares/validate");
const { forgotPassword } = require("../validations/Password");
const { resetPassword } = require("../validations/Password");
const { changePassword } = require("../validations/Password");
const updateProfile = require("../validations/update");
const passport = require("passport");
const uploader = require("../middlewares/uploader");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.getUsers
  );

router
  .route("/forgot-password")
  .post(validate(forgotPassword), controller.forgotPassword);

router
  .route("/reset-password/:token")
  .post(validate(resetPassword), controller.resetPassword);

router
  .route("/change-password")
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(changePassword),
    controller.changePassword
  );

router
  .route("/profile")
  .put(
    uploader("avatar"),
    validate(updateProfile),
    passport.authenticate("accessToken", { session: false }),
    controller.updateProfile
  );

router
  .route("/delete-account")
  .delete(
    passport.authenticate("accessToken", { session: false }),
    controller.deleteAccount
  );
module.exports = router;
