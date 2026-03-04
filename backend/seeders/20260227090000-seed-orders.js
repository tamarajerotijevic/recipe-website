'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM Users ORDER BY id ASC"
    );
    if (!users.length) {
      throw new Error("Seed orders: users table is empty. Create users first.");
    }

    const [products] = await queryInterface.sequelize.query(
      "SELECT id, name, price FROM products ORDER BY id ASC"
    );
    if (!products.length) {
      throw new Error("Seed orders: products table is empty. Run product seeders first.");
    }

    const productMap = new Map(
      products.map((p) => [Number(p.id), { name: p.name, price: Number(p.price) }])
    );

    const userIds = users.map((u) => Number(u.id));
    const baseDate = new Date();

    const makeDate = (monthOffset, day) => {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - monthOffset);
      d.setDate(day);
      d.setHours(10, 0, 0, 0);
      return d;
    };

    let nextOrderId = 5001;
    const orders = [];
    const items = [];
    const history = [];

    const addHistory = (orderId, userId, date, flow) => {
      for (let i = 1; i < flow.length; i += 1) {
        const createdAt = new Date(date);
        createdAt.setDate(createdAt.getDate() + i);
        history.push({
          orderId,
          changedByUserId: userId,
          oldStatus: flow[i - 1],
          newStatus: flow[i],
          createdAt,
          updatedAt: createdAt,
        });
      }
    };

    const addOrder = (userId, date, status, paymentStatus, itemSpecs) => {
      const orderId = nextOrderId;
      nextOrderId += 1;

      let totalAmount = 0;

      itemSpecs.forEach((spec) => {
        const product = productMap.get(spec.productId);
        if (!product) return;

        const unitPrice = product.price;
        const qty = Number(spec.quantity);
        const lineTotal = unitPrice * qty;
        totalAmount += lineTotal;

        items.push({
          orderId,
          productId: spec.productId,
          productNameSnapshot: product.name,
          unitPriceSnapshot: unitPrice,
          quantity: qty,
          lineTotal,
          createdAt: date,
          updatedAt: date,
        });
      });

      orders.push({
        id: orderId,
        userId,
        totalAmount,
        currency: "RSD",
        paymentMethod: "SIMULATED",
        paymentStatus,
        status,
        deliveryAddress: "Bulevar 1, Beograd",
        paidAt: paymentStatus === "PAID" ? date : null,
        createdAt: date,
        updatedAt: date,
      });

      if (paymentStatus === "PAID") {
        addHistory(orderId, userId, date, ["NEW", "PROCESSING", "SHIPPED", "DELIVERED"]);
      } else {
        addHistory(orderId, userId, date, ["NEW", "CANCELLED"]);
      }
    };

    const itemSets = [
      [{ productId: 1, quantity: 2 }, { productId: 5, quantity: 1 }],
      [{ productId: 9, quantity: 1 }, { productId: 21, quantity: 2 }],
      [{ productId: 17, quantity: 1 }, { productId: 35, quantity: 2 }],
      [{ productId: 13, quantity: 1 }, { productId: 15, quantity: 1 }],
      [{ productId: 27, quantity: 1 }, { productId: 29, quantity: 2 }],
    ];

    for (let i = 0; i < 6; i += 1) {
      const userA = userIds[i % userIds.length];
      const userB = userIds[(i + 1) % userIds.length];
      const userC = userIds[(i + 2) % userIds.length];

      addOrder(userA, makeDate(i, 5), "DELIVERED", "PAID", itemSets[i % itemSets.length]);
      addOrder(userB, makeDate(i, 15), "SHIPPED", "PAID", itemSets[(i + 1) % itemSets.length]);
      addOrder(userC, makeDate(i, 25), "CANCELLED", "FAILED", itemSets[(i + 2) % itemSets.length]);
    }

    const orderIds = orders.map((o) => o.id);

    await queryInterface.bulkDelete('order_status_history', {
      orderId: { [Sequelize.Op.in]: orderIds },
    });
    await queryInterface.bulkDelete('order_items', {
      orderId: { [Sequelize.Op.in]: orderIds },
    });
    await queryInterface.bulkDelete('orders', {
      id: { [Sequelize.Op.in]: orderIds },
    });

    await queryInterface.bulkInsert('orders', orders);
    await queryInterface.bulkInsert('order_items', items);
    await queryInterface.bulkInsert('order_status_history', history);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_status_history', {
      orderId: { [Sequelize.Op.between]: [5001, 5018] },
    });
    await queryInterface.bulkDelete('order_items', {
      orderId: { [Sequelize.Op.between]: [5001, 5018] },
    });
    await queryInterface.bulkDelete('orders', {
      id: { [Sequelize.Op.between]: [5001, 5018] },
    });
  },
};
