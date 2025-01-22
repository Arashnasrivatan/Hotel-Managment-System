const express = require("express");
const controller = require("./../controllers/Booking");
const validate = require("./../middlewares/validate");
const bookingValidateSchema = require("./../validations/booking");
const passport = require("passport");
const isAdmin = require("./../middlewares/isAdmin");

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getBookings
  )
  .post(
    passport.authenticate("accessToken", { session: false }),
    validate(bookingValidateSchema),
    controller.create
  );

router
  .route("/:id")
  .get(
    passport.authenticate("accessToken", { session: false }),
    controller.getBooking
  )
  .delete(
    passport.authenticate("accessToken", { session: false }),
    controller.cancelBooking
  );

module.exports = router;
