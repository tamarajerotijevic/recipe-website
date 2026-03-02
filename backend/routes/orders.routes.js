const router = require("express").Router();
const controller = require("../controllers/orders.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.post("/checkout", requireAuth, requireRole("user", "admin"), controller.checkout);
router.get("/admin", requireAuth, requireRole("admin"), controller.adminList);
router.get("/admin/stats/monthly", requireAuth, requireRole("admin"), controller.adminStatsMonthly);
router.get("/admin/stats/top-products", requireAuth, requireRole("admin"), controller.adminStatsTopProducts);
router.get("/admin/:id", requireAuth, requireRole("admin"), controller.adminGetById);
router.patch("/admin/:id/status", requireAuth, requireRole("admin"), controller.adminUpdateStatus);

module.exports = router;