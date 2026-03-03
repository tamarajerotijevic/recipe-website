const router = require("express").Router(); 
const controller = require("../controllers/cart.controller"); 
const { requireAuth, requireRole } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: Cart 
*     description: Korpa (cart_items) 
*/ 
 
/** 
* @swagger 
* /api/cart: 
*   get: 
*     tags: [Cart] 
*     summary: Prikaz korpe (stavke sa Product + IngredientType) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Lista stavki korpe 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/CartItemResponse' 
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
router.get("/", requireAuth, requireRole("user", "admin"), controller.getCart); 
 
/** 
* @swagger 
* /api/cart: 
*   post: 
*     tags: [Cart] 
*     summary: Dodaj u korpu (ako postoji, povećava quantity) 
*     security: 
*       - bearerAuth: [] 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/CartItemAddRequest' 
*     responses: 
*       201: 
*         description: Dodato u korpu 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/CartMutateResponse' 
*       200: 
*         description: Ažurirana količina (postojeća stavka) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/CartMutateResponse' 
*       400: 
*         description: Neispravan zahtev 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       404: 
*         description: Proizvod ne postoji 
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
router.post("/", requireAuth, requireRole("user", "admin"), controller.addToCart); 
 
/** 
* @swagger 
* /api/cart: 
*   delete: 
*     tags: [Cart] 
*     summary: Isprazni korpu 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Obrisano 
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
router.delete("/", requireAuth, requireRole("user", "admin"), controller.clearCart); 
 
/** 
* @swagger 
* /api/cart/{productId}: 
*   delete: 
*     tags: [Cart] 
*     summary: Ukloni proizvod iz korpe 
*     security: 
*       - bearerAuth: [] 
*     parameters: 
*       - in: path 
*         name: productId 
*         required: true 
*         schema: 
*           type: integer 
*     responses: 
*       200: 
*         description: Uklonjeno 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       404: 
*         description: Nema stavke u korpi 
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
router.delete( 
  "/:productId", 
  requireAuth, 
  requireRole("user", "admin"), 
  controller.removeFromCart 
); 
 
/** 
* @swagger 
* /api/cart/{productId}: 
*   patch: 
*     tags: [Cart] 
*     summary: Promeni količinu stavke u korpi 
*     security: 
*       - bearerAuth: [] 
*     parameters: 
*       - in: path 
*         name: productId 
*         required: true 
*         schema: 
*           type: integer 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/CartItemUpdateRequest' 
*     responses: 
*       200: 
*         description: Ažurirano 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/CartMutateResponse' 
*       400: 
*         description: Neispravni podaci 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       404: 
*         description: Stavka ne postoji 
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
router.patch( 
  "/:productId", 
  requireAuth, 
  requireRole("user", "admin"), 
  controller.updateCartItemQuantity 
); 
 
module.exports = router; 
