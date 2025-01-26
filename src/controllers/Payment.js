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
                attributes: { exclude: ["user_id", "room_id", "created_at", "updated_at"] },
                include: [
                        {
                                model: User,
                                as: "user",
                                attributes: { exclude: ["password", "created_at", "updated_at"] },
                        },
                        {
                                model: Room,
                                as: "room",
                                attributes: { exclude: ["amenities", "created_at", "updated_at"] },
                        }
                ]
        }
      ]
    });

    if (payments.count === 0) {
      return response(res, 404, "هیچ تراکنشی یافت نشد");
    }

    if(!payments.rows[0]) return response(res, 404, "تراکنشی در این صفحه وجود ندارد");

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
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
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
