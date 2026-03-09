'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [
      {
        id: 1,
        name: 'Karbonara špageti',
        description: 'Klasičan italijanski recept sa jajima, sirom i pančetom',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYE0baxn14n7lJI2qzFWL3jNSmTBRXUt0yZg&s',
        difficulty: 'Srednja',
        prepTimeMinutes: 20,
        createdAt: now, updatedAt: now,
      },
      {
        id: 2,
        name: 'Cezar salata',
        description: 'Sveža zelena salata sa domaćim Cezar prelivom',
        imageUrl: 'https://www.cuisinart.ca/dw/image/v2/ABAF_PRD/on/demandware.static/-/Sites-ca-cuisinart-sfra-Library/default/dw617e433c/images/recipe-Images/caesar-salad-recipe.jpg?sw=1200&sh=1200&sm=fit',
        difficulty: 'Lako',
        prepTimeMinutes: 10,
        createdAt: now, updatedAt: now,
      },
      {
        id: 3,
        name: 'Grilovani losos',
        description: 'Savršeno grilovani losos sa sosom od limuna i maslaca',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJy7e7FNp7D3XHt8SSWKZyej_gLn9u60YFFQ&s',
        difficulty: 'Srednja',
        prepTimeMinutes: 25,
        createdAt: now, updatedAt: now,
      },
      {
        id: 4,
        name: 'Tortilje sa govedinom',
        description: 'Zacinjene tortilje punjene mlevenim mesom i svežim povrćem',
        imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.GmWBA8l6QZ9TGr1UoFqqUgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
        difficulty: 'Lako',
        prepTimeMinutes: 15,
        createdAt: now, updatedAt: now,
      },
      {
        id: 5,
        name: 'Čokoladni kolač',
        description: 'Čokoladni kolač sa više slojeva i bogatim filom',
        imageUrl: 'https://th.bing.com/th/id/R.275d9439152c32cb61ccb36fc387c29d?rik=J%2f819nbEt%2fuaSg&pid=ImgRaw&r=0',
        difficulty: 'Teško',
        prepTimeMinutes: 40,
        createdAt: now, updatedAt: now,
      },
      {
        id: 6,
        name: 'Pad Thai',
        description: 'Popularno tajlandsko jelo od prženih pirinčanih rezanaca i škampa,',
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.X1UNbQGg11vM61WPsRGf3QHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
        difficulty: 'Srednja',
        prepTimeMinutes: 20,
        createdAt: now, updatedAt: now,
      },
    ];

    await queryInterface.bulkDelete('recipes', {
      id: rows.map((row) => row.id),
    });

    await queryInterface.bulkInsert('recipes', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('recipes', null, {});
  },
};
