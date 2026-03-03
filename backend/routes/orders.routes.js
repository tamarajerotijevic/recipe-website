const router = require("express").Router(); 
const controller = require("../controllers/orders.controller"); 
const { requireAuth, requireRole } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: Orders 
*     description: Narudžbine (checkout) 
*   - name: AdminOrders 
*     description: Admin narudžbine + statistika 
*/ 
 
/** 
* @swagger 
* /api/orders/checkout: 
*   post: 
*     tags: [Orders] 
*     summary: Checkout (kreira narudžbinu iz korpe) 
*     security: 
*       - bearerAuth: [] 
*     requestBody: 
*       required: false 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/CheckoutRequest' 
*     responses: 
*       201: 
*         description: Narudžbina kreirana (PAID ili FAILED) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/CheckoutResponse' 
*       400: 
*         description: Korpa prazna / neispravno 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       401: 
*         description: Niste ulogovani 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/checkout", requireAuth, requireRole("user", "admin"), controller.checkout); 
 
/** 
* @swagger 
* /api/orders/admin: 
*   get: 
*     tags: [AdminOrders] 
*     summary: Lista svih narudžbina (ADMIN) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Lista narudžbina (mapirano iz controllera) 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/OrderSummary' 
*       401: 
*         description: Niste ulogovani 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/admin", requireAuth, requireRole("admin"), controller.adminList); 
 
/** 
* @swagger 
* /api/orders/admin/stats/monthly: 
*   get: 
*     tags: [AdminOrders] 
*     summary: Statistika po mesecima (samo PAID) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: items[{month, orderCount, revenue}] 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MonthlyStatsResponse' 
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/admin/stats/monthly", requireAuth, requireRole("admin"), controller.adminStatsMonthly); 
 
/** 
* @swagger 
* /api/orders/admin/stats/top-products: 
*   get: 
*     tags: [AdminOrders] 
*     summary: Top proizvodi (samo PAID) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: items[{productId, productName, totalQty, totalRevenue}] 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/TopProductsStatsResponse' 
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/admin/stats/top-products", requireAuth, requireRole("admin"), controller.adminStatsTopProducts); 
 
/** 
* @swagger 
* /api/orders/admin/{id}: 
*   get: 
*     tags: [AdminOrders] 
*     summary: Detalji narudžbine (ADMIN) + items + history 
*     security: 
*       - bearerAuth: [] 
*     parameters: 
*       - in: path 
*         name: id 
*         required: true 
*         schema: 
*           type: integer 
*     responses: 
*       200: 
*         description: Narudžbina + stavke + istorija 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/OrderDetailsResponse' 
*       404: 
*         description: Ne postoji 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/admin/:id", requireAuth, requireRole("admin"), controller.adminGetById); 
 
/** 
* @swagger 
* /api/orders/admin/{id}/status: 
*   patch: 
*     tags: [AdminOrders] 
*     summary: Promena statusa narudžbine (ADMIN) + upis u istoriju 
*     security: 
*       - bearerAuth: [] 
*     parameters: 
*       - in: path 
*         name: id 
*         required: true 
*         schema: 
*           type: integer 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/AdminUpdateStatusRequest' 
*     responses: 
*       200: 
*         description: Status promenjen 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/AdminUpdateStatusResponse' 
*       400: 
*         description: Neispravan status 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       404: 
*         description: Ne postoji 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.patch("/admin/:id/status", requireAuth, requireRole("admin"), controller.adminUpdateStatus); 
 
module.exports = router; 