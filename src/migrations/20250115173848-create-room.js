"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Rooms", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      room_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },
      floor: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      room_type: {
        type: Sequelize.ENUM,
        values: ["single", "double", "suite"],
        allowNull: false,
        validate: {
          isIn: [["single", "double", "suite"]],
        },
      },
      capacity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      price_per_night: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Rooms");
  },
};
