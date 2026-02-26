'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'RSD',
      },

      paymentMethod: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'SIMULATED',
      },
      paymentStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING', // PENDING | PAID | FAILED
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'NEW',
      },

      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'orders',
      timestamps: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
    Order.hasMany(models.OrderStatusHistory, { foreignKey: 'orderId', as: 'history' });
  };

  return Order;
};