const express = require("express");
const controller = require("./../controllers/Auth");
const validate = require("./../middlewares/validate");
const registerValidateSchema = require("./../validations/register");
const loginValidateSchema = require("./../validations/login");
const passport = require("passport");
const uploader = require("./../middlewares/uploader");

const router = express.Router();

router
  .route("/register")
  .post(uploader("avatar"),validate(registerValidateSchema), controller.register);

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

router.route("/refresh").post(passport.authenticate("refreshToken", { session: false }),controller.refreshToken);

router
  .route("/logout")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.logout
  );
module.exports = router;

