const response = require("../utils/response");
const { Payment, Booking, User, Room } = require("../db");

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
              }
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
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};
