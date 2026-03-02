const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs:  10 * 60 * 1000 , // 10 minuta
  max: 5,                   // max 5 pokušaja
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Previše pokušaja. Pokušaj ponovo za 10 minuta.",
  },
});

module.exports = { authLimiter };