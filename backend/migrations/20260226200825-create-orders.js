'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'RSD',
      },

      paymentMethod: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'SIMULATED',
      },

      paymentStatus: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING', // PENDING | PAID | FAILED
      },

      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'NEW', // NEW | PROCESSING | SHIPPED | DELIVERED | CANCELED
      },

      deliveryAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
