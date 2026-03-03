const router = require("express").Router(); 
const controller = require("../controllers/product.controller"); 
const { requireAuth, requireRole } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: Products 
*     description: Proizvodi (products) 
*/ 
 
/** 
* @swagger 
* /api/products: 
*   get: 
*     tags: [Products] 
*     summary: Lista svih proizvoda (sa IngredientType) 
*     responses: 
*       200: 
*         description: Lista proizvoda 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/Product' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/", controller.getAll); 
 
/** 
* @swagger 
* /api/products: 
*   post: 
*     tags: [Products] 
*     summary: Kreiranje proizvoda (ADMIN) 
*     security: 
*       - bearerAuth: [] 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/ProductCreateRequest' 
*     responses: 
*       201: 
*         description: Kreiran proizvod (sa IngredientType) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/Product' 
*       400: 
*         description: Neispravni podaci 
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
*       403: 
*         description: Nije admin 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška pri kreiranju 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/", requireAuth, requireRole("admin"), controller.create); 
 
/** 
* @swagger 
* /api/products/{id}: 
*   delete: 
*     tags: [Products] 
*     summary: Brisanje proizvoda (ADMIN) 
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
*         description: Uspešno obrisano 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       400: 
*         description: Nevažeći id 
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
*       403: 
*         description: Nije admin 
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
*       500: 
*         description: Greška pri brisanju 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.delete("/:id", requireAuth, requireRole("admin"), controller.remove); 
 
module.exports = router; 