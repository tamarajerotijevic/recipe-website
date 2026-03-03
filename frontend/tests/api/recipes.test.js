import { describe, test, expect, vi, beforeEach } from "vitest";

// 1) Mockujemo apiFetch iz client.js
vi.mock("../../src/api/client", () => ({
  apiFetch: vi.fn(),
}));

// 2) Uvozimo apiFetch (mock) i funkcije koje testiramo
import { apiFetch } from "../../src/api/client";
import {
  getRecipes,
  getRecipeById,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  createRecipe,
  deleteRecipe,
  getRecipeNutrition,
  getFavoriteRecipeIds,
} from "../../src/api/recipes";

describe("recipes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getRecipes poziva /recipes", async () => {
    apiFetch.mockResolvedValueOnce([]);

    await getRecipes();

    expect(apiFetch).toHaveBeenCalledWith("/recipes");
  });

  test("getRecipeById poziva /recipes/:id", async () => {
    apiFetch.mockResolvedValueOnce({ id: 7 });

    await getRecipeById(7);

    expect(apiFetch).toHaveBeenCalledWith("/recipes/7");
  });

  test("getFavoriteRecipeIds poziva /recipes/favorites", async () => {
    apiFetch.mockResolvedValueOnce([1, 2, 3]);

    await getFavoriteRecipeIds();

    expect(apiFetch).toHaveBeenCalledWith("/recipes/favorites");
  });

  test("addFavoriteRecipe šalje POST na /recipes/favorites sa recipeId", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await addFavoriteRecipe(10);

    expect(apiFetch).toHaveBeenCalledWith("/recipes/favorites", {
      method: "POST",
      body: JSON.stringify({ recipeId: 10 }),
    });
  });

  test("removeFavoriteRecipe šalje DELETE na /recipes/favorites/:id", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await removeFavoriteRecipe(10);

    expect(apiFetch).toHaveBeenCalledWith("/recipes/favorites/10", {
      method: "DELETE",
    });
  });

  test("createRecipe šalje POST na /recipes sa payload", async () => {
    apiFetch.mockResolvedValueOnce({ id: 99 });

    const payload = { title: "Test recept", price: 123 };
    await createRecipe(payload);

    expect(apiFetch).toHaveBeenCalledWith("/recipes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  });

  test("deleteRecipe šalje DELETE na /recipes/:id", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await deleteRecipe(5);

    expect(apiFetch).toHaveBeenCalledWith("/recipes/5", { method: "DELETE" });
  });

  test("getRecipeNutrition poziva /recipes/:id/nutrition", async () => {
    apiFetch.mockResolvedValueOnce({ calories: 500 });

    await getRecipeNutrition(3);

    expect(apiFetch).toHaveBeenCalledWith("/recipes/3/nutrition");
  });
});