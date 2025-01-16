'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      //TODO: booking_id
      amount: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM,
        values: ["pending", "paid", "failed"],
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "paid", "failed"]],
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
    await queryInterface.dropTable('Payments');
  }
};