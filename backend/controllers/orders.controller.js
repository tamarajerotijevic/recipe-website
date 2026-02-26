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