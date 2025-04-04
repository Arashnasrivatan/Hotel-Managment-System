const { DataTypes } = require("sequelize");

const Payment = (sequelize) =>
  {return sequelize.define(
    "payment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      amount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      payment_type: {
        type: DataTypes.ENUM,
        values: ["normal", "return"],
        allowNull: false,
        defaultValue: "normal",
        validate: {
          isIn: [["normal", "return"]],
        },
      },
      track_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique:true
      },
      booking_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "Booking",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  )};

module.exports = Payment;
