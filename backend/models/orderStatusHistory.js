'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    'OrderStatusHistory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      changedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      oldStatus: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      newStatus: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
    },
    {
      tableName: 'order_status_history',
      timestamps: true,
    }
  );

  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.Order, { foreignKey: 'orderId' });
    OrderStatusHistory.belongsTo(models.User, { foreignKey: 'changedByUserId' });
  };

  return OrderStatusHistory;
};