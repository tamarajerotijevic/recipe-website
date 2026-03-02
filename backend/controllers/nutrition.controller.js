const db = require("../models");
const axios = require("axios");

function normalizeUnit(unitRaw) {
  const u = String(unitRaw || "").trim().toLowerCase();
  if (u === "g" || u === "gram" || u === "grama") return "g";
  if (u === "kg" || u === "kilogram" || u === "kilograma") return "kg";
  if (u === "ml") return "ml";
  if (u === "l" || u === "lt" || u === "litar" || u === "lit") return "l";

  // komadi
  if (u === "komad" || u === "kom" || u === "kom." || u === "komadi" || u === "pcs")
    return "piece";

  // kašike
  if (u === "kasika" || u === "kašika" || u === "tbsp") return "tbsp";
  if (u === "kasicica" || u === "kašičica" || u === "tsp") return "tsp";

  if (u === "češanj" || u === "cesanj") return "clove";
  return u || "";
}

exports.getRecipeNutrition = async (req, res) => {
  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey)
      return res.status(500).json({ message: "SPOONACULAR_API_KEY nije definisan u .env" });

    const id = Number(req.params.id);

    const recipe = await db.Recipe.findByPk(id, {
      include: [
        {
          model: db.RecipeIngredient,
          include: [
            { model: db.IngredientType, attributes: ["id", "name", "edamamName"] },
          ],
        },
      ],
    });

    if (!recipe) return res.status(404).json({ message: "Recept nije pronađen." });

    // Formiraj listu sastojaka
    const ingredients = (recipe.RecipeIngredients || [])
      .map((ri) => {
        const qty = Math.round(ri.quantity * 100) / 100; // Zaokruži na 2 decimale
        const unit = normalizeUnit(ri.unit) || "";
        const name = ri.IngredientType?.edamamName || ri.IngredientType?.name || "";
        if (!name) return null;
        
        // Formatiraj bez .00 ako je ceo broj
        const qtyStr = Number.isInteger(qty) ? qty.toString() : qty.toString();
        
        // Spoonacular ne prepoznaje "piece", koristi samo ime
        if (unit === "piece") {
          return `${qtyStr} ${name}`.trim();
        }
        return `${qtyStr} ${unit} ${name}`.trim();
      })
      .filter(Boolean);

    if (!ingredients.length)
      return res.status(400).json({ message: "Nema sastojaka za računanje." });

    // Step 1: Parse ingredients with Spoonacular
    const parseUrl = `https://api.spoonacular.com/recipes/parseIngredients?apiKey=${apiKey}`;
    const ingredientList = ingredients.join("\n");

    console.log("SENDING TO SPOONACULAR (parseIngredients):", ingredientList);
    
    const parseResponse = await axios.post(
      parseUrl, 
      `ingredientList=${encodeURIComponent(ingredientList)}`, 
      { 
        timeout: 15000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    
    const parsedIngredients = parseResponse.data || [];
    console.log("PARSED INGREDIENTS:", JSON.stringify(parsedIngredients, null, 2));

    // Step 2: Get nutrition for each ingredient
    let calories = 0, protein = 0, fat = 0, carbs = 0;
    
    for (const ingredient of parsedIngredients) {
      const nutritionUrl = `https://api.spoonacular.com/food/ingredients/${ingredient.id}/information?amount=${ingredient.amount}&unit=${encodeURIComponent(ingredient.unit || ingredient.unitShort)}&apiKey=${apiKey}`;
      
      try {
        const nutResponse = await axios.get(nutritionUrl, { timeout: 5000 });
        const nutData = nutResponse.data || {};
        
        console.log(`NUTRITION FOR ${ingredient.name}:`, JSON.stringify(nutData.nutrition || {}, null, 2));
        
        if (nutData.nutrition) {
          const nut = nutData.nutrition;

          // Prefer calories found inside the nutrients array (e.g. { name: 'Calories', amount: 250 })
          let caloriesFromNutrients = 0;
          if (nut.nutrients && Array.isArray(nut.nutrients)) {
            nut.nutrients.forEach(n => {
              const nameLC = (n.name || "").toLowerCase();
              if (nameLC.includes("calorie")) caloriesFromNutrients += (n.amount || 0);
              if (nameLC.includes("protein")) protein += (n.amount || 0);
              if (nameLC.includes("fat") && !nameLC.includes("saturated")) fat += (n.amount || 0);
              if (nameLC.includes("carbohydrate") || nameLC.includes("carb")) carbs += (n.amount || 0);
            });
          }

          if (caloriesFromNutrients > 0) {
            calories += caloriesFromNutrients;
          } else {
            // Fallback to any top-level calories field if present
            calories += (nut.calories || 0);
          }
        }
      } catch (err) {
        console.warn(`Could not fetch nutrition for ${ingredient.name}:`, err.message);
      }
    }

    return res.json({
      recipeId: id,
      totals: {
        calories: Math.round(calories),
        protein: Math.round(protein),
        fat: Math.round(fat),
        carbs: Math.round(carbs),
      },
      usedIngredients: parsedIngredients.length,
    });
  } catch (err) {
    console.error(err?.response?.data || err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Greška pri računaju nutritivnih vrednosti";
    return res.status(500).json({ message: msg });
  }
};
