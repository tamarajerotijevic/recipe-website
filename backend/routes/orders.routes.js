const router = require("express").Router();
const controller = require("../controllers/orders.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.post("/checkout", requireAuth, requireRole("user", "admin"), controller.checkout);

module.exports = router;