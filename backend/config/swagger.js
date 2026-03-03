const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Veb prodavnica sa receptima - API",
    version: "1.0.0",
    description: "Swagger/OpenAPI specifikacija za backend (Node.js + Express).",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      // ---------- Common ----------
      MessageResponse: {
        type: "object",
        properties: { message: { type: "string" } },
      },

      HealthResponse: {
        type: "object",
        properties: { ok: { type: "boolean", example: true } },
      },

      // ---------- Auth ----------
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Marko Markovic" },
          email: { type: "string", example: "marko@gmail.com" },
          role: { type: "string", example: "user" },
        },
      },

      AuthRegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Marko Markovic" },
          email: { type: "string", example: "marko@gmail.com" },
          password: { type: "string", example: "test12345" },
        },
      },

      AuthLoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "marko@gmail.com" },
          password: { type: "string", example: "test12345" },
        },
      },

      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOi..." },
          user: { $ref: "#/components/schemas/UserPublic" },
        },
      },

      MeResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserPublic" },
        },
      },

      // ---------- Ingredient types ----------
      IngredientType: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Mlečni proizvodi" },
          edamamName: { type: "string", example: "milk", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      // ---------- Products ----------
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Mleko" },
          ingredientTypeId: { type: "integer", example: 1 },
          packageAmount: { type: "string", example: "1L", nullable: true },
          price: { type: "number", example: 129.99 },
          imageUrl: { type: "string", example: "https://...", nullable: true },
          IngredientType: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Mlečni proizvodi" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      ProductCreateRequest: {
        type: "object",
        required: ["name", "ingredientType", "price"],
        properties: {
          name: { type: "string", example: "Mleko" },
          ingredientType: { type: "string", example: "Mlečni proizvodi" },
          packageAmount: { type: "string", example: "1L", nullable: true },
          price: { type: "number", example: 129.99 },
          image: { type: "string", example: "https://...", nullable: true },
        },
      },

      // ---------- Recipes ----------
      RecipeIngredientCreate: {
        type: "object",
        required: ["name", "unit"],
        properties: {
          name: { type: "string", example: "Jaja" }, // u tvom kodu: IngredientType.findOrCreate({ name: ing.name })
          quantity: { type: "number", example: 2, nullable: true },
          unit: { type: "string", example: "kom" }, // u bazi: unit je obavezan string
        },
      },

      RecipeCreateRequest: {
        type: "object",
        required: ["name", "description"],
        properties: {
          name: { type: "string", example: "Pasta Carbonara" },
          description: { type: "string", example: "Brz i ukusan recept..." },
          image: { type: "string", example: "https://...", nullable: true },
          difficulty: { type: "string", example: "easy", nullable: true },
          prepTime: { type: "string", example: "20 min", nullable: true }, // ti parsiraš broj iz stringa
          ingredients: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipeIngredientCreate" },
            nullable: true,
          },
        },
      },

      RecipeIngredient: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          recipeId: { type: "integer", example: 10 },
          ingredientTypeId: { type: "integer", example: 2 },
          quantity: { type: "number", example: 200, nullable: true },
          unit: { type: "string", example: "g" },
          IngredientType: {
            type: "object",
            properties: {
              id: { type: "integer", example: 2 },
              name: { type: "string", example: "Slanina" },
              edamamName: { type: "string", example: "bacon", nullable: true },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      Recipe: {
        type: "object",
        properties: {
          id: { type: "integer", example: 10 },
          name: { type: "string", example: "Pasta Carbonara" },
          description: { type: "string", example: "Brz i ukusan recept..." },
          imageUrl: { type: "string", example: "https://...", nullable: true },
          difficulty: { type: "string", example: "easy", nullable: true },
          prepTimeMinutes: { type: "integer", example: 20, nullable: true },
          RecipeIngredients: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipeIngredient" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      FavoritesListResponse: {
        type: "array",
        description: "Lista recipeId vrednosti omiljenih recepata",
        items: { type: "integer", example: 10 },
      },

      FavoriteAddRequest: {
        type: "object",
        required: ["recipeId"],
        properties: {
          recipeId: { type: "integer", example: 10 },
        },
      },

      // ---------- Nutrition ----------
      NutritionResponse: {
        type: "object",
        properties: {
          recipeId: { type: "integer", example: 10 },
          totals: {
            type: "object",
            properties: {
              calories: { type: "integer", example: 540 },
              protein: { type: "integer", example: 22 },
              fat: { type: "integer", example: 18 },
              carbs: { type: "integer", example: 50 },
            },
          },
          usedIngredients: { type: "integer", example: 5 },
        },
      },

      // ---------- Cart ----------
      CartItemAddRequest: {
        type: "object",
        required: ["productId"],
        properties: {
          productId: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2, nullable: true },
        },
      },

      CartItemUpdateRequest: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "integer", example: 3 },
        },
      },

      CartItemResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          productId: { type: "integer", example: 2 },
          quantity: { type: "integer", example: 3 },
          product: { $ref: "#/components/schemas/Product" },
        },
      },

      CartMutateResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          item: {
            type: "object",
            description: "Vraća CartItem instancu (id,userId,productId,quantity,createdAt,updatedAt)",
          },
        },
      },

      // ---------- My products ----------
      MyProductResponse: {
        type: "object",
        properties: {
          productId: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
          product: { $ref: "#/components/schemas/Product" },
        },
      },

      MyProductsMutateResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          item: {
            type: "object",
            description: "Vraća UserProduct instancu (userId,productId,quantity,createdAt,updatedAt)",
          },
        },
      },

      // ---------- Orders ----------
      CheckoutRequest: {
        type: "object",
        properties: {
          paymentMethod: { type: "string", example: "SIMULATED", nullable: true },
          simulate: {
            type: "string",
            example: "success",
            description: 'success | fail (u tvom kodu se proverava "success")',
            nullable: true,
          },
          deliveryAddress: { type: "string", example: "Kragujevac, ..." , nullable: true },
        },
      },

      CheckoutResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          orderId: { type: "integer", example: 15 },
          paymentStatus: { type: "string", example: "PAID" },
          totalAmount: { type: "number", example: 999.99 },
        },
      },

      OrderSummary: {
        type: "object",
        properties: {
          id: { type: "integer", example: 15 },
          userId: { type: "integer", example: 1 },
          user: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Marko Markovic" },
              email: { type: "string", example: "marko@gmail.com" },
            },
          },
          totalAmount: { type: "number", example: 999.99 },
          currency: { type: "string", example: "RSD" },
          paymentStatus: { type: "string", example: "PAID" },
          status: { type: "string", example: "NEW" },
          paidAt: { type: "string", format: "date-time", nullable: true },
          deliveryAddress: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      OrderItemResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 101 },
          productId: { type: "integer", example: 2 },
          productNameSnapshot: { type: "string", example: "Mleko" },
          unitPriceSnapshot: { type: "number", example: 129.99 },
          quantity: { type: "integer", example: 2 },
          lineTotal: { type: "number", example: 259.98 },
        },
      },

      OrderHistoryEntry: {
        type: "object",
        properties: {
          id: { type: "integer", example: 501 },
          oldStatus: { type: "string", example: "NEW" },
          newStatus: { type: "string", example: "PROCESSING" },
          changedByUserId: { type: "integer", nullable: true, example: 1 },
          changedBy: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Admin" },
              email: { type: "string", example: "admin@gmail.com" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      OrderDetailsResponse: {
        allOf: [
          { $ref: "#/components/schemas/OrderSummary" },
          {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItemResponse" },
              },
              history: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderHistoryEntry" },
              },
            },
          },
        ],
      },

      AdminUpdateStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", example: "PROCESSING" },
        },
      },

      AdminUpdateStatusResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Status uspešno izmenjen." },
          orderId: { type: "integer", example: 15 },
          oldStatus: { type: "string", example: "NEW" },
          newStatus: { type: "string", example: "PROCESSING" },
          historyId: { type: "integer", example: 501 },
        },
      },

      MonthlyStatsResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string", example: "2026-03" },
                orderCount: { type: "integer", example: 12 },
                revenue: { type: "number", example: 12345.67 },
              },
            },
          },
        },
      },

      TopProductsStatsResponse: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "integer", example: 2 },
                productName: { type: "string", example: "Mleko" },
                totalQty: { type: "integer", example: 30 },
                totalRevenue: { type: "number", example: 3899.7 },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.js"],
};

module.exports = swaggerJSDoc(options);
