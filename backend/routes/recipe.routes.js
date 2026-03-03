const router = require("express").Router(); 
const controller = require("../controllers/recipe.controller"); 
const nutritionController = require("../controllers/nutrition.controller"); 
const { requireAuth, requireRole } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: Recipes 
*     description: Recepti (recipes) + sastojci (recipe_ingredients) 
*   - name: Favorites 
*     description: Omiljeni recepti (favorite_recipes) 
*   - name: Nutrition 
*     description: Nutritivne vrednosti recepta (Spoonacular) 
*/ 
 
/** 
* @swagger 
* /api/recipes: 
*   get: 
*     tags: [Recipes] 
*     summary: Lista recepata (sa RecipeIngredients + IngredientType) 
*     responses: 
*       200: 
*         description: Lista recepata 
*         content: 
*           application/json: 
*             schema: 
*               type: array 
*               items: 
*                 $ref: '#/components/schemas/Recipe' 
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
* /api/recipes: 
*   post: 
*     tags: [Recipes] 
*     summary: Kreiranje recepta (ADMIN) 
*     security: 
*       - bearerAuth: [] 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/RecipeCreateRequest' 
*     responses: 
*       201: 
*         description: Kreiran recept (sa sastojcima) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/Recipe' 
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
* /api/recipes/{id}: 
*   delete: 
*     tags: [Recipes] 
*     summary: Brisanje recepta (ADMIN) 
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
*         description: Recept ne postoji 
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
 
/** 
* @swagger 
* /api/recipes/favorites: 
*   get: 
*     tags: [Favorites] 
*     summary: Lista omiljenih (vraća samo recipeId niz) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Niz recipeId 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/FavoritesListResponse' 
*       401: 
*         description: Niste ulogovani 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/favorites", requireAuth, controller.getFavorites); 
 
/** 
* @swagger 
* /api/recipes/favorites: 
*   post: 
*     tags: [Favorites] 
*     summary: Dodaj u omiljene 
*     security: 
*       - bearerAuth: [] 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/FavoriteAddRequest' 
*     responses: 
*       200: 
*         description: Dodato (message) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
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
*       500: 
*         description: Greška 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/favorites", requireAuth, controller.addFavorite); 
 
/** 
* @swagger 
* /api/recipes/favorites/{recipeId}: 
*   delete: 
*     tags: [Favorites] 
*     summary: Ukloni iz omiljenih 
*     security: 
*       - bearerAuth: [] 
*     parameters: 
*       - in: path 
*         name: recipeId 
*         required: true 
*         schema: 
*           type: integer 
*     responses: 
*       200: 
*         description: Uklonjeno (message) 
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
router.delete("/favorites/:recipeId", requireAuth, controller.removeFavorite); 
 
/** 
* @swagger 
* /api/recipes/{id}/nutrition: 
*   get: 
*     tags: [Nutrition] 
*     summary: "Nutritivne vrednosti recepta (totals: calories/protein/fat/carbs)" 
*     parameters: 
*       - in: path 
*         name: id 
*         required: true 
*         schema: 
*           type: integer 
*     responses: 
*       200: 
*         description: Nutritivne vrednosti 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/NutritionResponse' 
*       404: 
*         description: Recept nije pronađen 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška (npr. SPOONACULAR_API_KEY nije definisan) 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/:id/nutrition", nutritionController.getRecipeNutrition); 
 
/** 
* @swagger 
* /api/recipes/{id}: 
*   get: 
*     tags: [Recipes] 
*     summary: Detalji recepta (sa sastojcima) 
*     parameters: 
*       - in: path 
*         name: id 
*         required: true 
*         schema: 
*           type: integer 
*     responses: 
*       200: 
*         description: Recept 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/Recipe' 
*       404: 
*         description: Recept nije pronađen 
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
router.get("/:id", controller.getById); 
 
module.exports = router; 