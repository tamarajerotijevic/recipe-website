const db = require("../models");

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await db.CartItem.findAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          include: [{ model: db.IngredientType, attributes: ["id", "name"] }],
        },
      ],
      order: [[db.Product, "name", "ASC"]],
    });

    const result = rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      quantity: r.quantity,
      product: r.Product,
    }));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri čitanju korpe." });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.body.userId) {
    return res.status(400).json({ message: "Ne sme se slati userId (IDOR zaštita)." });
    }

    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId je obavezan." });
    }

    // provera da proizvod postoji
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Proizvod ne postoji." });
    }

    const qty = Number(quantity || 1);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity mora biti ceo broj >= 1." });
    }

    // ako već postoji u korpi
    const existing = await db.CartItem.findOne({ where: { userId, productId } });

    if (existing) {
      existing.quantity = existing.quantity + qty;
      await existing.save();
      return res.status(200).json({ message: "Količina ažurirana.", item: existing });
    }

    const created = await db.CartItem.create({ userId, productId, quantity: qty });
    return res.status(201).json({ message: "Dodano u korpu.", item: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri dodavanju u korpu." });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ message: "Neispravan productId." });
    }

    const deleted = await db.CartItem.destroy({ where: { userId, productId } });

    if (!deleted) {
      return res.status(404).json({ message: "Stavka nije pronađena u korpi." });
    }

    return res.json({ message: "Obrisano iz korpe." });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(500).json({ message: "Greška pri brisanju iz korpe." });
  }
};
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    if (req.body.userId) {
      return res.status(400).json({ message: "Ne sme se slati userId (IDOR zaštita)." });
    }
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ message: "Neispravan productId." });
    }
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: "quantity je obavezna." });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity mora biti ceo broj >= 1." });
    }

    const cartItem = await db.CartItem.findOne({ where: { userId, productId } });
    if (!cartItem) {
      return res.status(404).json({ message: "Stavka nije pronađena u korpi." });
    }

    cartItem.quantity = qty;
    await cartItem.save();

    return res.json({ message: "Količina ažurirana.", item: cartItem });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Greška pri ažuriranju količine." });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await db.CartItem.destroy({ where: { userId } });

    return res.json({ message: 'Korpa je očišćena.', deletedCount: deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Greška pri čišćenju korpe.' });
  }
};
