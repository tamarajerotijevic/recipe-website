export async function searchExternalRecipes(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(trimmed)}`
  );

  if (!response.ok) {
    throw new Error("Neuspešno prikazivanje recepata.");
  }

  const data = await response.json();
  const meals = data?.meals || [];

  return meals.map((meal) => ({
    id: meal.idMeal,
    name: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory || "",
    area: meal.strArea || "",
    sourceUrl: meal.strSource || "",
    youtubeUrl: meal.strYoutube || "",
  }));
}
