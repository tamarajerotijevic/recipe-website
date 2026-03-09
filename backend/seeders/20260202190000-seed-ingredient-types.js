'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [
      { id: 1, name: 'Špageti', edamamName: 'spaghetti', createdAt: now, updatedAt: now },
      { id: 2, name: 'Jaja', edamamName: 'egg', createdAt: now, updatedAt: now },
      { id: 3, name: 'Sir', edamamName: 'cheese', createdAt: now, updatedAt: now },
      { id: 4, name: 'Maslac', edamamName: 'butter', createdAt: now, updatedAt: now },
      { id: 5, name: 'Losos', edamamName: 'salmon', createdAt: now, updatedAt: now },
      { id: 6, name: 'Zelena salata', edamamName: 'green lettuce', createdAt: now, updatedAt: now },
      { id: 7, name: 'Pančeta', edamamName: 'pancetta', createdAt: now, updatedAt: now },
      { id: 8, name: 'Crni biber', edamamName: 'black pepper', createdAt: now, updatedAt: now },
      { id: 9, name: 'Prepečeni hleb', edamamName: 'croutons', createdAt: now, updatedAt: now },
      { id: 10, name: 'Limun', edamamName: 'lemon', createdAt: now, updatedAt: now },
      { id: 11, name: 'Beli luk', edamamName: 'garlic', createdAt: now, updatedAt: now },
      { id: 12, name: 'Majčina dušica', edamamName: 'oregano', createdAt: now, updatedAt: now },
      { id: 13, name: 'Mleveno meso', edamamName: 'ground beef', createdAt: now, updatedAt: now },
      { id: 14, name: 'Kukuruzne tortilje', edamamName: 'corn tortillas', createdAt: now, updatedAt: now },
      { id: 15, name: 'Paradajz', edamamName: 'tomato', createdAt: now, updatedAt: now },
      { id: 16, name: 'Brašno', edamamName: 'flour', createdAt: now, updatedAt: now },
      { id: 17, name: 'Kakao', edamamName: 'cocoa powder', createdAt: now, updatedAt: now },
      { id: 18, name: 'Šećer', edamamName: 'sugar', createdAt: now, updatedAt: now },
      { id: 19, name: 'Pirinčani rezanci', edamamName: 'rice noodles', createdAt: now, updatedAt: now },
      { id: 20, name: 'Škampi', edamamName: 'shrimp', createdAt: now, updatedAt: now },
      { id: 21, name: 'Kikiriki', edamamName: 'peanuts', createdAt: now, updatedAt: now },
      { id: 22, name: 'Limeta', edamamName: 'lime', createdAt: now, updatedAt: now },
      { id: 23, name: 'Soja sos', edamamName: 'soy sauce', createdAt: now, updatedAt: now },
    ];

    await queryInterface.bulkDelete('ingredient_types', {
      id: rows.map((row) => row.id),
    });

    await queryInterface.bulkInsert('ingredient_types', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ingredient_types', null, {});
  },
};
