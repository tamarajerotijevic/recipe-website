const db = require('../models');
 
exports.getAll = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10);
    const limit = Number.parseInt(req.query.limit, 10);
    const usePagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

    const query = {
      include: [
        {
          model: db.RecipeIngredient,
          include: [
            {
              model: db.IngredientType,
              attributes: ['id', 'name', 'edamamName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    };

    if (usePagination) {
      const offset = (page - 1) * limit;
      const { count, rows } = await db.Recipe.findAndCountAll({
        ...query,
        limit,
        offset,
        distinct: true,
      });

      return res.json({
        data: rows,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      });
    }

    const recipes = await db.Recipe.findAll(query);
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri čitanju recepata.' });
  }
};
 
exports.getById = async (req, res) => {

  try {

    const id = Number(req.params.id);
 
    const recipe = await db.Recipe.findByPk(id, {

      include: [

        {
          model: db.RecipeIngredient,
          include: [
            {
              model: db.IngredientType,

             attributes: ['id', 'name', 'edamamName'],

            },

          ],

        },

      ],

    });
 
    if (!recipe) {

      return res.status(404).json({ message: 'Recept nije pronađen.' });

    }
 
    res.json(recipe);

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: 'Greška pri čitanju recepta.' });

  }

};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await db.FavoriteRecipe.findAll({
      where: { userId },
      attributes: ['recipeId'],
      order: [['createdAt', 'DESC']],
    });

    res.json(favorites.map((f) => f.recipeId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri čitanju omiljenih recepata.' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = Number(req.body.recipeId);

    if (!recipeId) {
      return res.status(400).json({ message: 'recipeId je obavezan.' });
    }

    const existing = await db.FavoriteRecipe.findOne({ where: { userId, recipeId } });
    if (!existing) {
      await db.FavoriteRecipe.create({ userId, recipeId });
    }

    return res.status(201).json({ recipeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri dodavanju u omiljene.' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = Number(req.params.recipeId);

    if (!recipeId) {
      return res.status(400).json({ message: 'recipeId je obavezan.' });
    }

    await db.FavoriteRecipe.destroy({ where: { userId, recipeId } });

    return res.json({ recipeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Greška pri uklanjanju iz omiljenih.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, image, difficulty, prepTime, ingredients } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'name and description are required.' });
    }

    // parse prepTime minute iz stringa u broj
    let prepTimeMinutes = null;
    if (prepTime != null) {
      const m = String(prepTime).match(/(\d+)/);
      if (m) prepTimeMinutes = Number(m[1]);
    }

    const created = await db.Recipe.create({
      name,
      description,
      imageUrl: image || null,
      difficulty: difficulty || null,
      prepTimeMinutes,
    });

    // sastojci: niz { name, quantity, unit }
    if (Array.isArray(ingredients)) {
      for (const ing of ingredients) {
        if (!ing.name) continue;
        const [ingType] = await db.IngredientType.findOrCreate({ where: { name: ing.name } });
        await db.RecipeIngredient.create({
          recipeId: created.id,
          ingredientTypeId: ingType.id,
          quantity: ing.quantity || null,
          unit: ing.unit || '',
        });
      }
    }

    const recipe = await db.Recipe.findByPk(created.id, {
      include: [
        { model: db.RecipeIngredient, include: [{ model: db.IngredientType, attributes: ['id', 'name', 'edamamName'] }] },
      ],
    });

    return res.status(201).json(recipe);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Greška pri kreiranju recepta.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Nevažeći id.' });

    // obriši sastojke recepta prvo (cascade možda već to radi)
    await db.RecipeIngredient.destroy({ where: { recipeId: id } });
    const deleted = await db.Recipe.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Recept nije pronađen.' });

    return res.json({ id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Greška pri brisanju recepta.' });
  }
};

 