const express = require("express");
const controller = require("./../controllers/Payment");
const validate = require("./../middlewares/validate");
const { createPayment, updatePayment } = require("./../validations/payment");
const passport = require("passport");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.getPayments
  )
  .post(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    validate(createPayment),
    controller.createPayment
  );

router
  .route("/:id")
  .get(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.getPayment
  )
  .put(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    validate(updatePayment),
    controller.updatePayment
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    isAdmin,
    controller.deletePayment
  );

module.exports = router;
