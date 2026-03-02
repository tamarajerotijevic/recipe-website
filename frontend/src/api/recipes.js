import { apiFetch } from "./client";

export async function getRecipes() {
  return apiFetch("/recipes");
}

export async function getRecipeById(id) {
  return apiFetch(`/recipes/${id}`);
}

export async function getFavoriteRecipeIds() {
  return apiFetch("/recipes/favorites");
}

export async function addFavoriteRecipe(recipeId) {
  return apiFetch("/recipes/favorites", {
    method: "POST",
    body: JSON.stringify({ recipeId }),
  });
}

export async function removeFavoriteRecipe(recipeId) {
  return apiFetch(`/recipes/favorites/${recipeId}`, {
    method: "DELETE",
  });
}

export function createRecipe(payload) {
  return apiFetch("/recipes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteRecipe(id) {
  return apiFetch(`/recipes/${id}`, { method: "DELETE" });
}

export async function getRecipeNutrition(id) {
  return apiFetch(`/recipes/${id}/nutrition`);
}
