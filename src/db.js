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

const User = require("./models/User")(db);
const Booking = require("./models/Booking")(db);
const Room = require("./models/Room")(db);
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
