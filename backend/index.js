require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Rute
const healthRoutes = require("./routes/health.routes");
const ingredientTypeRoutes = require("./routes/ingredientType.routes");
const productRoutes = require("./routes/product.routes");
const recipeRoutes = require("./routes/recipe.routes");
const authRoutes = require("./routes/auth.routes");
const userProductRoutes = require("./routes/userProduct.routes");
const cartRoutes = require("./routes/cart.routes");
const ordersRoutes = require("./routes/orders.routes");
<<<<<<< HEAD

const app = express();

// ✅ Ograničenje veličine zahteva (DoS zaštita)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cors());

=======

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

>>>>>>> e8ea821 (Dodata swagger dokumentacija i izmena ruta)
// API rute
app.use("/api/health", healthRoutes);
app.use("/api/ingredient-types", ingredientTypeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/my-products", userProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);

<<<<<<< HEAD
app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body je prevelik." });
  }
  next(err);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Ruta ne postoji" });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
=======
app.use((req, res) => {
  res.status(404).json({ message: "Ruta ne postoji" });
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
>>>>>>> e8ea821 (Dodata swagger dokumentacija i izmena ruta)
