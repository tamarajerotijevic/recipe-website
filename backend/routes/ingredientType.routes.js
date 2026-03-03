const router = require("express").Router(); 
const controller = require("../controllers/ingredientType.controller"); 
 
/** 
* @swagger 
* tags: 
*   - name: IngredientTypes 
*     description: Tipovi sastojaka (ingredient_types) 
*/ 
 
/** 
* @swagger 
* /api/ingredient-types: 
*   get: 
*     tags: [IngredientTypes] 
*     summary: Lista tipova sastojaka 
*     responses: 
*       200: 
*         description: Lista tipova sastojaka 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/IngredientType' 
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/", controller.getAll); 
 
module.exports = router;