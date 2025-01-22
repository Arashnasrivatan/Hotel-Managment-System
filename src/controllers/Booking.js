const { Room, Booking, Payment } = require("./../db");
const { Op } = require("sequelize");
const moment = require("moment");
const response = require("./../utils/response");

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
    });

    if (bookings.count === 0) {
      return response(res, 404, "رزرو یافت نشد");
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

    const newBooking = await Booking.create({
      user_id: req.user.id,
      room_id,
      check_in_date: checkInWithTime.toDate(),
      check_out_date: checkOutWithTime.toDate(),
    });

    const newPayment = await Payment.create({
      payment_date: new Date(),
      booking_id: newBooking.id,
      amount: totalAmount,
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
      amount: newPayment.amount,
    };

    //TODO Payment link

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
      where
    });

    if (!booking) {
      return response(res, 404, "رزروی با این شناسه یافت نشد");
    }

    return response(res, 200, "رزرو با موفقیت یافت شد", booking);
  } catch (err) {
    next(err);
  }
};
