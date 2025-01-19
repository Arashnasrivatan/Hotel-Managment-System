const { DataTypes } = require("sequelize");

const RoomImages = (sequelize) =>
  sequelize.define(
    "room_image",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "rooms",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      image_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "room_images",
      timestamps: false,
    }
  );

module.exports = RoomImages;
