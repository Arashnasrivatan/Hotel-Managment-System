const { Sequelize } = require("sequelize");
const configs = require("./configs");

const db = new Sequelize({
  host: configs.db.host,
  port: configs.db.port,
  username: configs.db.user,
  password: configs.db.password,
  database: configs.db.name,
  dialect: configs.db.dialect,
  logging: configs.isProduction ? false : console.log,
});

/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const User = require("./models/User")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Booking = require("./models/Booking")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Room = require("./models/Room")(db);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
const Payment = require("./models/Payment")(db);

User.hasMany(Booking, {
  foreignKey: "user_id",
  as: "bookings",
});
Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Room.hasMany(Booking, {
  foreignKey: "room_id",
  as: "bookings",
});
Booking.belongsTo(Room, {
  foreignKey: "room_id",
  as: "room",
});

module.exports = { db, User, Booking, Room, Payment };
