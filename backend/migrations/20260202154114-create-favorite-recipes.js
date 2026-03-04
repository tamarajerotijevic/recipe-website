'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorite_recipes', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'recipes', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // da se isti recept ne može dva puta dodati u favorite istog usera
    await queryInterface.addConstraint('favorite_recipes', {
      fields: ['userId', 'recipeId'],
      type: 'unique',
      name: 'unique_user_recipe_favorite',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('favorite_recipes');
  },
};
