const db = require("../models");

function toNumber(dec) {
  return Number(dec);
}

exports.checkout = async (req, res) => {
  const userId = req.user.id;

  // uspešno/neuspešno
  const { paymentMethod = "SIMULATED", simulate = "success", deliveryAddress = null } = req.body;
  const isSuccess = String(simulate).toLowerCase() === "success";

  const t = await db.sequelize.transaction();
  try {
    //Učitavanje  korpe korisnika i proizvoda 
    const cartItems = await db.CartItem.findAll({
      where: { userId },
      include: [{ model: db.Product }],
      transaction: t,
    });

    if (!cartItems.length) {
      await t.rollback();
      return res.status(400).json({ message: "Korpa je prazna." });
    }

    // Izracunavanje ukupnog iznosa
    let totalAmount = 0;

    const itemsPayload = cartItems.map((ci) => {
      const p = ci.Product;

      const unitPrice = toNumber(p.price);  
      const qty = Number(ci.quantity);
      const lineTotal = unitPrice * qty;

      totalAmount += lineTotal;

      return {
        productId: p.id,
        productNameSnapshot: p.name,        
        unitPriceSnapshot: unitPrice,
        quantity: qty,
        lineTotal,
      };
    });

    //Kreiraj order 
    const order = await db.Order.create(
      {
        userId,
        totalAmount,
        currency: "RSD",
        paymentMethod,
        paymentStatus: isSuccess ? "PAID" : "FAILED",
        status: "NEW",
        deliveryAddress,
        paidAt: isSuccess ? new Date() : null,
      },
      { transaction: t }
    );

    //Kreiranje order_items
    const orderItems = itemsPayload.map((it) => ({ ...it, orderId: order.id }));
    await db.OrderItem.bulkCreate(orderItems, { transaction: t });

    //Ako je uspešno -> očisti korpu. Ako je FAILED -> korpa ostaje.
    if (isSuccess) {
      await db.CartItem.destroy({ where: { userId }, transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: isSuccess
        ? "Plaćanje uspešno. Narudžbina kreirana."
        : "Plaćanje neuspešno. Narudžbina je upisana kao FAILED.",
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Greška pri kreiranju narudžbine." });
  }
};

const ALLOWED_STATUSES = ["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

exports.adminList = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [{ model: db.User, attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    return res.json(
      (orders || []).map((o) => ({
        id: o.id,
        userId: o.userId,
        user: o.User ? { id: o.User.id, name: o.User.name, email: o.User.email } : null,
        totalAmount: toNumber(o.totalAmount),
        currency: o.currency,
        paymentStatus: o.paymentStatus,
        status: o.status,
        paidAt: o.paidAt,
        deliveryAddress: o.deliveryAddress,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri učitavanju narudžbina." });
  }
};

exports.adminGetById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const order = await db.Order.findByPk(id, {
      include: [
        { model: db.User, attributes: ["id", "name", "email"] },
        { model: db.OrderItem, as: "items" },
        {
          model: db.OrderStatusHistory,
          as: "history",
          separate: true,
          order: [["createdAt", "DESC"]],
          include: [{ model: db.User, attributes: ["id", "name", "email"] }],
        },
      ],
    });

    if (!order) return res.status(404).json({ message: "Narudžbina ne postoji." });

    return res.json({
      id: order.id,
      userId: order.userId,
      user: order.User ? { id: order.User.id, name: order.User.name, email: order.User.email } : null,
      totalAmount: toNumber(order.totalAmount),
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      status: order.status,
      paidAt: order.paidAt,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      items: (order.items || []).map((it) => ({
        id: it.id,
        productId: it.productId,
        productNameSnapshot: it.productNameSnapshot,
        unitPriceSnapshot: toNumber(it.unitPriceSnapshot),
        quantity: it.quantity,
        lineTotal: toNumber(it.lineTotal),
      })),

      history: (order.history || []).map((h) => ({
        id: h.id,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedByUserId: h.changedByUserId,
        changedBy: h.User ? { id: h.User.id, name: h.User.name, email: h.User.email } : null,
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri učitavanju detalja narudžbine." });
  }
};

exports.adminUpdateStatus = async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Neispravan status. Dozvoljeno: ${ALLOWED_STATUSES.join(", ")}`,
    });
  }

  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Narudžbina ne postoji." });
    }

    const oldStatus = order.status;
    const newStatus = status;

    if (oldStatus === newStatus) {
      await t.rollback();
      return res.json({ message: "Status je već postavljen.", status: order.status });
    }

    order.status = newStatus;
    await order.save({ transaction: t });

    const historyEntry = await db.OrderStatusHistory.create(
      {
        orderId: order.id,
        changedByUserId: req.user?.id || null,
        oldStatus,
        newStatus,
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({
      message: "Status uspešno izmenjen.",
      orderId: order.id,
      oldStatus,
      newStatus,
      historyId: historyEntry.id,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Greška pri promeni statusa." });
  }
};

exports.adminStatsMonthly = async (req, res) => {
  try {
    // Izraz za formatiranje datuma na nivou meseca, npr"2025-01" 
    const monthExpr = db.sequelize.fn("DATE_FORMAT", db.sequelize.col("createdAt"), "%Y-%m");

    // Uzimamo samo PAID narudžbine, grupišemo po mesecima i računamo broj narudžbina i ukupnu zaradu
    const rows = await db.Order.findAll({
      attributes: [
        [monthExpr, "month"],
        [db.sequelize.fn("COUNT", db.sequelize.col("id")), "orderCount"],
        [db.sequelize.fn("SUM", db.sequelize.col("totalAmount")), "revenue"],
      ],
      where: { paymentStatus: "PAID" },
      group: [monthExpr],
      order: [[monthExpr, "ASC"]],
      raw: true,
    });

    //pretvaramo u broj da ne bi imali stringove u frontend grafiku
    const items = (rows || []).map((r) => ({
      month: r.month,
      orderCount: Number(r.orderCount || 0),
      revenue: Number(r.revenue || 0),
    }));

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri učitavanju statistike po mesecima." });
  }
};

exports.adminStatsTopProducts = async (req, res) => {
  try {

    // Uzimamo samo PAID narudžbine, grupišemo po proizvodu i računamo ukupnu količinu 
    // i zaradu, sortiramo po zaradi i limitiramo na top 10    
    const rows = await db.OrderItem.findAll({
      attributes: [
        "productId",
        "productNameSnapshot", 
        [db.sequelize.fn("SUM", db.sequelize.col("OrderItem.quantity")), "totalQty"], 
        [db.sequelize.fn("SUM", db.sequelize.col("OrderItem.lineTotal")), "totalRevenue"], 
      ], 
      include: [
        {
          model: db.Order,
          attributes: [],
          where: { paymentStatus: "PAID" },
          required: true,
        },
      ],
      group: ["OrderItem.productId", "OrderItem.productNameSnapshot"],
      order: [[db.sequelize.fn("SUM", db.sequelize.col("OrderItem.lineTotal")), "DESC"]],
      limit: 10,
      raw: true,
    });

    // pretvaramo u broj da ne bi imali stringove u frontend grafiku

    const items = (rows || []).map((r) => ({
      productId: r.productId,
      productName: r.productNameSnapshot,
      totalQty: Number(r.totalQty || 0),
      totalRevenue: Number(r.totalRevenue || 0),
    }));

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri učitavanju top proizvoda." });
  }
};