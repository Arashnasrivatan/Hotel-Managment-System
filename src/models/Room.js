const { DataTypes } = require("sequelize");

const Room = (sequelize) =>
  {return sequelize.define(
    "room",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      room_number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      floor: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      room_type: {
        type: DataTypes.ENUM,
        values: ["single", "double", "suite"],
        allowNull: false,
        validate: {
          isIn: [["single", "double", "suite"]],
        },
      },
      capacity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      price_per_night: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      amenities: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: "rooms",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  )};

module.exports = Room;
