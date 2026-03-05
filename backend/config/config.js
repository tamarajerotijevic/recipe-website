require("dotenv").config();
const base = {
 username: process.env.DB_USER,
 password: process.env.DB_PASS || null,
 database: process.env.DB_NAME,
 host: process.env.DB_HOST,
 port: Number(process.env.DB_PORT || 3306),
 dialect: process.env.DB_DIALECT || "mysql",
};
module.exports = {
 development: {
   ...base,
 },
 production: {
   ...base,
   // Aiven MySQL koristi TLS; za free/simplest varijantu koristimo "require" bez CA fajla
   dialectOptions: {
     ssl: {
       rejectUnauthorized: false,
     },
   },
   logging: false,
 },
};