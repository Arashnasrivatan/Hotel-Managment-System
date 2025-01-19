"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn(
        "payments",
        "booking_id",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "bookings",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "bookings",
        "user_id",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "bookings",
        "room_id",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "rooms",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );

      await queryInterface.createTable("room_images", {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        room_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "rooms",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },

        image_path: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      });

      await queryInterface.addConstraint(
        "bookings",
        {
          fields: ["user_id", "room_id", "check_in_date", "check_out_date"],
          type: "unique",
          name: "unique_booking",
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn("bookings", "room_id", { transaction });
      await queryInterface.removeColumn("bookings", "user_id", { transaction });
      await queryInterface.removeColumn("payments", "booking_id", { transaction });

      await queryInterface.dropTable("room_images", { transaction });

      await queryInterface.removeConstraint("bookings", "unique_booking", {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
