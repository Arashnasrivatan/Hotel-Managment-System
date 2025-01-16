const { DataTypes } = require("sequelize");

const Payment = (sequelize) =>
  sequelize.define(
    "payment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      //TODO: booking_id
      amount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM,
        values: ["pending", "paid", "failed"],
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "paid", "failed"]],
        },
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

module.exports = Payment;
