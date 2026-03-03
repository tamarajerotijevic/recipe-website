const router = require("express").Router(); 
const controller = require("../controllers/userProduct.controller"); 
const { requireAuth, requireRole } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: MyProducts 
*     description: Proizvodi korisnika (user_products) 
*/ 
 
/** 
* @swagger 
* /api/my-products: 
*   get: 
*     tags: [MyProducts] 
*     summary: Lista "mojih proizvoda" (stavke sa Product + IngredientType) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Lista korisnikovih proizvoda 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/MyProductResponse' 
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
router.get("/", requireAuth, requireRole("user", "admin"), controller.getMine); 
 
/** 
* @swagger 
* /api/my-products: 
*   post: 
*     tags: [MyProducts] 
*     summary: Dodaj proizvod u moje proizvode (ako postoji, povećava quantity) 
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
*         description: Dodato 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MyProductsMutateResponse' 
*       200: 
*         description: Ažurirana količina 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MyProductsMutateResponse' 
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
router.post("/", requireAuth, requireRole("user", "admin"), controller.addMine); 
 
/** 
* @swagger 
* /api/my-products/{productId}: 
*   delete: 
*     tags: [MyProducts] 
*     summary: Ukloni proizvod iz mojih proizvoda 
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
*         description: Ne postoji stavka 
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
*/ 
router.delete("/:productId", requireAuth, requireRole("user", "admin"), controller.removeMine); 
 
module.exports = router; 
