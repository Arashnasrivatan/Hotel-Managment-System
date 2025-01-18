const express = require("express");
const controller = require("./../controllers/Auth");
const validate = require("./../middlewares/validate");
const registerValidateSchema = require("./../validations/register");
const loginValidateSchema = require("./../validations/login");
const { resetPassword } = require("../validations/Password");
const { forgotPassword } = require("../validations/Password");
const { changePassword } = require("../validations/Password");
const passport = require("passport");
const uploader = require("./../middlewares/uploader");

const router = express.Router();

router
  .route("/register")
  .post(
    uploader("avatar"),
    validate(registerValidateSchema),
    controller.register
  );

router
  .route("/login")
  .post(
    validate(loginValidateSchema),
    passport.authenticate("local", { session: false }),
    controller.login
  );

router
  .route("/me")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getMe
  );

router
  .route("/refresh")
  .get(
    passport.authenticate("refreshToken", { session: false }),
    controller.refreshToken
  );

router
  .route("/logout")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.logout
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

module.exports = router;
