const response = require("../utils/response");
const { Payment, Booking, User, Room } = require("../db");
const zibal = require("./../services/zibal");

exports.getPayments = async (req, res, next) => {
  try {
    const bookingId = parseInt(req.query.bookingId) || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (bookingId) where.booking_id = bookingId;

    const payments = await Payment.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: ["booking_id", "created_at", "updated_at"] },
      include: [
        {
          model: Booking,
          as: "booking",
          attributes: {
            exclude: ["user_id", "room_id", "created_at", "updated_at"],
          },
          include: [
            {
              model: User,
              as: "user",
              attributes: { exclude: ["password", "created_at", "updated_at"] },
            },
            {
              model: Room,
              as: "room",
              attributes: {
                exclude: ["amenities", "created_at", "updated_at"],
              },
            },
          ],
        },
      ],
    });

    if (payments.count === 0) {
      return response(res, 404, "هیچ تراکنشی یافت نشد");
    }

    if (!payments.rows[0])
      return response(res, 404, "تراکنشی در این صفحه وجود ندارد");

    return response(res, 200, "تراکنش ها با موفقیت گرفته شد", {
      total: payments.count,
      currentPage: page,
      totalPages: Math.ceil(payments.count / limit),
      payments: payments.rows,
    });
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { amount, payment_status, payment_type, booking_id } = req.body;

    if (booking_id) {
      const booking = await Booking.findByPk(booking_id);
      if (!booking) {
        return response(res, 404, "رزروی با این شناسه یافت نشد");
      }
    }

    const payment = await Payment.create(
      { amount, payment_status, payment_type, booking_id },
      { raw: true }
    );
    return response(res, 201, "تراکنش با موفقیت ایجاد شد", payment);
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      attributes: { exclude: ["booking_id"] },
      include: [
        {
          model: Booking,
          as: "booking",
          attributes: {
            exclude: ["user_id", "room_id", "created_at", "updated_at"],
          },
          include: [
            {
              model: User,
              as: "user",
              attributes: { exclude: ["password", "created_at", "updated_at"] },
            },
            {
              model: Room,
              as: "room",
              attributes: {
                exclude: ["amenities", "created_at", "updated_at"],
              },
            },
          ],
        },
      ],
      raw: true,
    });
    if (!payment) {
      return response(res, 404, "تراکنش با این شناسه یافت نشد");
    }
    return response(res, 200, "تراکنش با موفقیت گرفته شد", payment);
  } catch (err) {
    next(err);
  }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return response(res, 404, "تراکنش با این شناسه یافت نشد");
    }

    const { amount, payment_status, payment_type } = req.body;
    payment.amount = amount || payment.amount;
    payment.payment_status = payment_status || payment.payment_status;
    payment.payment_type = payment_type || payment.payment_type;

    await payment.save();
    return response(res, 200, "تراکنش با موفقیت بروز رسانی شد", payment);
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return response(res, 404, "تراکنش با این شناسه یافت نشد");
    }
    await payment.destroy();
    return response(res, 200, "تراکنش با موفقیت حذف شد");
  } catch (err) {
    next(err);
  }
};

//! BUG
exports.verify = async (req, res, next) => {
  try {
    const { trackId } = req.query;

    const payment = await Payment.findOne({ where: { track_id: trackId } });

    if (!payment) {
      return response(res, 404, "رسید یافت نشد");
    }

    const booking = await Booking.findOne({ where: { track_id: trackId } });

    if (!booking) {
      return response(res, 404, "رزرو یافت نشد");
    }
    if (booking.status !== "pending" && payment.payment_status !== "pending") {
      return response(res, 400, "پرداخت قبلا صورت گرفته");
    }

    const verifiedPayment = await zibal.verifyPayment(trackId);

    if (verifiedPayment.result !== 100) {
      //* Way 1
      payment.payment_status = "failed";
      booking.status = "canceled";
      await payment.save();
      await booking.save();
      //* Way 2
      // await payment.destroy();
      // await booking.destroy();
      return response(res, 400, "پرداخت ناموفق بود");
    }
    payment.payment_status = "paid";
    booking.status = "confirmed";

    await payment.save();
    await booking.save();
    return response(res, 200, "رزرو با موفقیت پرداخت شد", { payment, booking });
  } catch (err) {
    next(err);
  }
};
