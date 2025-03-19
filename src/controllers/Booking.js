const { User, Room, Booking, Payment } = require("./../db");
const { Op } = require("sequelize");
const moment = require("moment");
const response = require("./../utils/response");
const zibal = require("./../services/zibal");

exports.getBookings = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = parseInt(req.query.userId) || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let where = {};

    if (user.role !== "admin") {
      where.user_id = user.id;
    }

    if (user.role === "admin" && userId) {
      where.user_id = userId;
    }

    const bookings = await Booking.findAndCountAll({
      where,
      limit,
      offset,
      attributes: {
        exclude: ["user_id", "room_id", "created_at", "updated_at"],
      },
      include: [
        {
          model: Room,
          as: "room",
          attributes: { exclude: ["amenities", "created_at", "updated_at"] },
        },
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "created_at", "updated_at"] },
        },
      ],
    });

    if (bookings.count === 0) {
      return response(res, 404, "رزرو یافت نشد");
    }

    if (!bookings.rows[0]) {
      return response(res, 404, "رزروی در این صفحه وجود ندارد");
    }

    return response(res, 200, "لیست رزروها با موفقیت گرفته شد", {
      total: bookings.count,
      page: parseInt(page),
      totalPages: Math.ceil(bookings.count / limit),
      bookings: bookings.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { room_id, check_in_date, check_out_date } = req.body;

    const room = await Room.findByPk(room_id);
    if (!room) {
      return response(res, 404, "اتاق یافت نشد");
    }

    const checkInWithTime = moment(check_in_date).set({
      hour: 14,
      minute: 0,
      second: 0,
    }); // 2 PM
    const checkOutWithTime = moment(check_out_date).set({
      hour: 12,
      minute: 0,
      second: 0,
    }); // 12 PM

    if (!checkInWithTime.isValid() || !checkOutWithTime.isValid()) {
      return response(res, 400, "تاریخ‌های وارد شده معتبر نیستند");
    }

    const existingBooking = await Booking.findOne({
      where: {
        room_id,
        check_in_date: { [Op.lte]: checkOutWithTime.toDate() },
        check_out_date: { [Op.gte]: checkInWithTime.toDate() },
      },
    });

    if (existingBooking) {
      return response(res, 400, "اتاق در این تاریخ قابل رزرو نیست");
    }

    const nights = checkOutWithTime.diff(checkInWithTime, "days");
    if (nights <= 0) {
      return response(res, 400, "تاریخ‌های وارد شده معتبر نیستند");
    }

    const totalAmount = nights * room.price_per_night;

    const paymentService = await zibal.createPayment(totalAmount);

    const newBooking = await Booking.create({
      user_id: req.user.id,
      room_id,
      check_in_date: checkInWithTime.toDate(),
      check_out_date: checkOutWithTime.toDate(),
      track_id: paymentService.trackId,
    });

    const newPayment = await Payment.create({
      payment_date: new Date(),
      booking_id: newBooking.id,
      amount: totalAmount,
      track_id: paymentService.trackId,
    });

    const cleanedBooking = {
      id: newBooking.id,
      status: newBooking.status,
      user_id: newBooking.user_id,
      room_id: newBooking.room_id,
    };

    const cleanedPayment = {
      id: newPayment.id,
      payment_status: newPayment.payment_status,
      payment_date: newPayment.payment_date,
      booking_id: newPayment.booking_id,
      amount: totalAmount,
      payment_url: paymentService.paymentUrl,
    };

    return response(res, 201, "رزرو با موفقیت ایجاد شد", {
      total_nights: nights,
      total_amount: totalAmount,
      check_in_time: checkInWithTime.format("YYYY-MM-DD HH:mm"),
      check_out_time: checkOutWithTime.format("YYYY-MM-DD HH:mm"),
      booking: cleanedBooking,
      payment: cleanedPayment,
    });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    let where = {};

    if (user.role === "admin") {
      where = { id };
    } else {
      where = { id, user_id: user.id };
    }
    const booking = await Booking.findByPk(id, {
      where,
      attributes: {
        exclude: ["user_id", "room_id", "created_at", "updated_at"],
      },
      include: [
        {
          model: Room,
          as: "room",
          attributes: { exclude: ["amenities", "created_at", "updated_at"] },
        },
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password", "created_at", "updated_at"] },
        },
      ],
    });

    if (!booking) {
      return response(res, 404, "رزروی با این شناسه یافت نشد");
    }

    return response(res, 200, "رزرو با موفقیت یافت شد", booking);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { room_id, check_in_date, check_out_date } = req.body;
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return response(res, 404, "رزروی با این شناسه یافت نشد");
    }

    if (req.user.role != "admin" && booking.user_id != req.user.id) {
      return response(res, 403, "شما اجازه ویرایش این رزرو را ندارید");
    }

    if (booking.status != "confirmed") {
      return response(
        res,
        400,
        "رزرو مد نظر شما لغو شده یا در انتظار پرداخت است"
      );
    }

    if (
      (!room_id || room_id == booking.room_id) &&
      (!check_in_date ||
        moment(check_in_date, "MM/DD/YYYY").isSame(
          moment(booking.check_in_date),
          "minute"
        )) &&
      (!check_out_date ||
        moment(check_out_date, "MM/DD/YYYY").isSame(
          moment(booking.check_out_date),
          "minute"
        ))
    ) {
      return response(res, 400, "هیچ فیلدی تغییر نکرده است");
    }

    const pendingPayments = await Payment.findAll({
      where: {
        booking_id: id,
        payment_status: "pending",
      },
    });

    const today = moment().startOf("day");
    const bookingCheckInDate = moment(booking.check_in_date).startOf("day");
    const bookingCheckOutDate = moment(booking.check_out_date).startOf("day");

    if (bookingCheckInDate.isSameOrBefore(today)) {
      return response(
        res,
        400,
        "امکان ویرایش رزرو پس از تاریخ ورود یا در همان روز وجود ندارد"
      );
    }

    if (check_in_date && bookingCheckInDate.isAfter(bookingCheckOutDate)) {
      return response(res, 400, "تاریخ ورود نمی تواند بعد از تاریخ خروج باشد");
    }

    if (check_out_date && bookingCheckOutDate.isBefore(bookingCheckInDate)) {
      return response(res, 400, "تاریخ خروج نمی تواند قبل از تاریخ ورود باشد");
    }

    const hasPendingReturn = pendingPayments.some((payment) => {
      return payment.payment_type === "return";
    });
    const hasPendingNormal = pendingPayments.some((payment) => {
      return payment.payment_type === "normal";
    });

    if (hasPendingReturn || hasPendingNormal) {
      let message = null;
      if (hasPendingNormal) message = "شما هنوز مبلغ رزرو را پرداخت نکرده‌اید.";
      if (hasPendingReturn)
        message =
          "هتل مبلغی به شما بدهکار است لطفا از طریق پشتیبانی مبلغ خود را دریافت کنید.";
      return response(res, 400, message, pendingPayments);
    }

    let room = null;
    let isRoomChanged = false;

    if (room_id && room_id !== booking.room_id) {
      room = await Room.findByPk(room_id);
      if (!room) {
        return response(res, 404, "اتاق با این شناسه یافت نشد");
      }
      isRoomChanged = true;
    } else {
      room = await Room.findByPk(booking.room_id);
      if (!room) {
        return response(res, 404, "اتاق با این شناسه یافت نشد");
      }
    }

    let checkInWithTime = moment(booking.check_in_date).set({
      hour: 14,
      minute: 0,
      second: 0,
    });

    let checkOutWithTime = moment(booking.check_out_date).set({
      hour: 12,
      minute: 0,
      second: 0,
    });

    if (check_in_date) {
      checkInWithTime = moment(check_in_date).set({
        hour: 14,
        minute: 0,
        second: 0,
      });
      if (!checkInWithTime.isValid()) {
        return response(res, 400, "تاریخ ورود به هتل معتبر نیست");
      }
    }

    if (check_out_date) {
      checkOutWithTime = moment(check_out_date).set({
        hour: 12,
        minute: 0,
        second: 0,
      });
      if (!checkOutWithTime.isValid()) {
        return response(res, 400, "تاریخ خروج از هتل معتبر نیست");
      }
    }

    const existingBooking = await Booking.findOne({
      where: {
        room_id: room.id,
        id: { [Op.ne]: booking.id },
        [Op.or]: [
          {
            check_in_date: {
              [Op.between]: [
                checkInWithTime.toDate(),
                checkOutWithTime.toDate(),
              ],
            },
          },
          {
            check_out_date: {
              [Op.between]: [
                checkInWithTime.toDate(),
                checkOutWithTime.toDate(),
              ],
            },
          },
        ],
      },
    });

    if (existingBooking) {
      return response(res, 400, "اتاق در این تاریخ قابل ویرایش رزرو نیست");
    }

    const nights = checkOutWithTime.diff(checkInWithTime, "days");
    if (!nights || nights <= 0) {
      return response(res, 400, "تاریخ‌های وارد شده معتبر نیستند");
    }

    const totalAmount = room.price_per_night * nights;

    const payments = await Payment.findAll({
      where: { booking_id: booking.id },
    });

    const totalPaid = payments.reduce((sum, payment) => {
      if (payment.payment_status === "paid") {
        if (payment.payment_type === "normal") {
          return sum + payment.amount;
        } else if (payment.payment_type === "return") {
          return sum - payment.amount;
        }
      }
      return sum;
    }, 0);

    let returnAmount = 0;
    let newPayment = null;
    let newReturnPayment = null;
    let paymentService = null;

    if (totalPaid > totalAmount) {
      returnAmount = totalPaid - totalAmount;
      newReturnPayment = await Payment.create({
        amount: returnAmount,
        payment_date: new Date(),
        payment_status: "pending",
        payment_type: "return",
        booking_id: booking.id,
      });
    } else if (totalPaid < totalAmount) {
      paymentService = await zibal.createPayment(totalAmount - totalPaid);
      newPayment = await Payment.create({
        amount: totalAmount - totalPaid,
        payment_date: new Date(),
        booking_id: booking.id,
        track_id: paymentService.trackId,
      });
      booking.status = "pending";
      booking.track_id = paymentService.trackId;
    }

    booking.room_id = room_id || booking.room_id;
    booking.check_in_date = checkInWithTime || booking.check_in_date;
    booking.check_out_date = checkOutWithTime || booking.check_out_date;

    await booking.save();

    let message = "رزرو با موفقیت ویرایش شد";
    if (returnAmount)
      message += ` شما میتوانید با تماس با پشتیبانی مبلغ ${returnAmount} را دریافت کنید`;
    if (newPayment)
      message += ` لطفا صورت حساب جدید را به مبلغ ${newPayment.amount} پرداخت کنید`;

    const responseData = {
      total_nights: nights,
      booking,
      isRoomChanged,
    };

    if (returnAmount) responseData.returnAmount = returnAmount;
    if (newReturnPayment) responseData.newReturnPayment;
    if (newPayment) {
      responseData.newPayment = newPayment;
      responseData.totalAmount = newPayment.amount;
    }
    if (paymentService) responseData.PaymentUrl = paymentService.paymentUrl;

    return response(res, 200, message, responseData);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const user = req.user;
    const { id } = req.params;

    let where = {};

    if (user.role === "admin") {
      where = { id };
    } else {
      where = { id, user_id: user.id };
    }

    const booking = await Booking.findByPk(id, {
      where,
    });

    if (!booking) {
      return response(res, 404, "رزروی با این شناسه یافت نشد");
    }

    const payment = await Payment.findOne({
      where: {
        booking_id: id,
        payment_status: "pending",
        payment_date: {
          [Op.lte]: new Date(),
        },
      },
    });

    if (payment) {
      payment.payment_status = "failed";
      await payment.save();
    }

    const now = Date.now();
    if (booking.check_in_date <= now) {
      return response(res, 400, "شما نمیتوانید رزرو رو در روز ورود لغو کنید");
    }

    if (booking.status !== "pending") {
      return response(res, 400, "رزرو در خالت انتظار شده است");
    }

    booking.status = "canceled";
    await booking.save();

    return response(res, 200, "رزرو با موفقیت لغو شد");
  } catch (err) {
    next(err);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { check_in_date, check_out_date } = req.body;

    if (!check_in_date || !check_out_date) {
      return response(res, 400, "تاریخ ورود و خروج الزامی است");
    }

    const checkInWithTime = moment(check_in_date, "MM/DD/YYYY").set({
      hour: 14,
      minute: 0,
      second: 0,
    });
    const checkOutWithTime = moment(check_out_date, "MM/DD/YYYY").set({
      hour: 12,
      minute: 0,
      second: 0,
    });

    if (!checkInWithTime.isValid() || !checkOutWithTime.isValid()) {
      return response(res, 400, "تاریخ‌های وارد شده معتبر نیستند");
    }

    if (checkOutWithTime.isSameOrBefore(checkInWithTime)) {
      return response(res, 400, "تاریخ خروج باید بعد از تاریخ ورود باشد");
    }

    const bookedRoomIds = await Booking.findAll({
      attributes: ["room_id"],
      where: {
        [Op.or]: [
          {
            check_in_date: {
              [Op.lte]: checkOutWithTime.toDate(),
            },
            check_out_date: {
              [Op.gte]: checkInWithTime.toDate(),
            },
          },
        ],
      },
    });

    const bookedRoomIdList = bookedRoomIds.map((booking) => {
      return booking.room_id;
    });

    const availableRooms = await Room.findAll({
      where: {
        id: { [Op.notIn]: bookedRoomIdList },
      },
    });

    return response(
      res,
      200,
      "اتاق‌های در دسترس با موفقیت یافت شدند",
      availableRooms
    );
  } catch (err) {
    next(err);
  }
};
