const { DataTypes } = require("sequelize");

const Booking = (sequelize) =>
  sequelize.define(
    "Booking",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      //TODO: user_id
      //TODO: room_id
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "confirmed", "canceled"],
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "confirmed", "canceled"]],
        },
      }
    },
    {
      tableName: "bookings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Booking;
