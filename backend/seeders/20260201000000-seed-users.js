'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {

    const saltRounds = 10;

    const now = new Date();

    const users = [
      {
        name: 'Jovana Dumić',
        email: 'jovanadumic@gmail.com',
        passwordPlain: 'jovana123',
        role: 'admin',
      },
      {
        name: 'Sandra Djurić',
        email: 'sandradjuric@gmail.com',
        passwordPlain: 'sandra123',
        role: 'admin',
      },
      {
        name: 'Tamara Jerotijević',
        email: 'tamarajerotijevic@gmail.com',
        passwordPlain: 'tamara123',
        role: 'admin',
      },
      {
        name: 'Petar Petrović',
        email: 'petarpetrovic@gmail.com',
        passwordPlain: 'petar123',
        role: 'user',
      },
    ];

    const rows = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.passwordPlain, saltRounds);

      rows.push({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        lastLoginAt: null,  
        createdAt: now,
        updatedAt: now,
      });
    }

    await queryInterface.bulkDelete('Users', {
      email: users.map((u) => u.email),
    });

    await queryInterface.bulkInsert('Users', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'Users',
      {
        email: [
          'jovanadumic@gmail.com',
          'sandradjuric@gmail.com',
          'tamarajerotijevic@gmail.com',
          'petarpetrovic@gmail.com',
        ],
      }
    );
  },
};