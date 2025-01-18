const response = require("../utils/response");

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return response(res, 403, "شما دسترسی لازم برای این عملیات را ندارید");
  }
  next();
}

module.exports = isAdmin;