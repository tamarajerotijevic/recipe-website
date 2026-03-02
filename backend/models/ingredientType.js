'use strict';

module.exports = (sequelize, DataTypes) => {
  const IngredientType = sequelize.define(
    'IngredientType',
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      edamamName: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: 'ingredient_types',
    }
  );

  IngredientType.associate = (models) => {
    IngredientType.hasMany(models.Product, { foreignKey: 'ingredientTypeId' });
    IngredientType.hasMany(models.RecipeIngredient, { foreignKey: 'ingredientTypeId' });
  };

  return IngredientType;
};
