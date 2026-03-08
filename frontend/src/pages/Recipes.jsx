import { useState, useEffect } from 'react';
import { findMissingIngredients, countMissingIngredients, groupRecipesByMissing } from '../data';
import { getRecipesPaged, getFavoriteRecipeIds, addFavoriteRecipe, removeFavoriteRecipe, getRecipeNutrition } from '../api/recipes';
import { searchExternalRecipes } from '../api/externalRecipes';
import { getProducts } from '../api/products';
import { addToCart as apiAddToCart, getCart as apiGetCart } from '../api/cart';
import Input from '../components/Input';
import Button from '../components/Button';

const EMPTY_ARRAY = [];
const PAGE_LIMIT = 6;

export default function Recipes({
  role = "guest",
  user = null,
  userProducts = EMPTY_ARRAY,
  cartItems = EMPTY_ARRAY,
  setCartItems = () => {}
}) {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [groupedRecipes, setGroupedRecipes] = useState({ canMakeNow: [], missing1to2: [], missingMore: [] });
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [externalQuery, setExternalQuery] = useState('');
  const [externalRecipes, setExternalRecipes] = useState([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState(null);
  const [externalSearched, setExternalSearched] = useState(false);

  const [nutrition, setNutrition] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);

  const sortFavoritesFirst = (list) => {
    return [...list].sort((a, b) => (b.isFavorite === true) - (a.isFavorite === true));
  };

  const normalizeRecipe = (recipe) => {
    const ingredients = (recipe.RecipeIngredients || []).map((ing) => ({
      name: ing.IngredientType?.name || '',
      quantity: Number(ing.quantity || 0),
      unit: ing.unit || '',
    }));

    return {
      ...recipe,
      image: recipe.imageUrl || recipe.image || '',
      prepTime: recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} min` : recipe.prepTime || '',
      ingredients,
    };
  };

  const normalizeProduct = (product) => ({
    ...product,
    ingredientType: product.IngredientType?.name || product.ingredientType || '',
    image: product.imageUrl || product.image || '🧺',
    price: Number(product.price || 0),
  });

  useEffect(() => {
    if (role !== 'user') {
      setFavoriteIds([]);
      setFavoritesLoaded(true);
      return;
    }

    getFavoriteRecipeIds()
      .then((ids) => setFavoriteIds(ids))
      .catch(() => setFavoriteIds([]))
      .finally(() => setFavoritesLoaded(true));
  }, [role]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRecipesPaged({ page, limit: PAGE_LIMIT }), getProducts()])
      .then(([recipesResponse, productsData]) => {
        const recipeItems = Array.isArray(recipesResponse) ? recipesResponse : recipesResponse?.data || [];
        const normalizedRecipes = recipeItems.map(normalizeRecipe).map((recipe) => ({
          ...recipe,
          isFavorite: favoriteIds.includes(recipe.id),
        }));

        const normalizedProducts = productsData.map(normalizeProduct);

        setRecipes(normalizedRecipes);
        setProducts(normalizedProducts);
        setFilteredRecipes(normalizedRecipes);
        setBaseLoaded(true);
        setTotalPages(recipesResponse?.pagination?.totalPages || 1);
      })
      .catch((err) => {
        setError(err?.message || 'Greška pri učitavanju podataka.');
      })
      .finally(() => setLoading(false));
  }, [role, page]);

  useEffect(() => {
    if (!baseLoaded) return;

    setRecipes((prev) =>
      prev.map((recipe) => ({
        ...recipe,
        isFavorite: favoriteIds.includes(recipe.id),
      }))
    );
  }, [favoriteIds, baseLoaded]);

  // ===== NUTRITION POST =====
  useEffect(() => {
    if (!selectedRecipe) {
      setNutrition(null);
      setNutritionLoading(false);
      setNutritionError(null);
      return;
    }

    let cancelled = false;
    setNutrition(null);
    setNutritionError(null);
    setNutritionLoading(true);

    getRecipeNutrition(selectedRecipe.id, { method: 'POST' })
      .then((data) => {
        if (cancelled) return;
        setNutrition(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setNutritionError(err?.message || 'Nije moguće izračunati nutritivne vrednosti.');
      })
      .finally(() => {
        if (cancelled) return;
        setNutritionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRecipe]);

  useEffect(() => {
    let filtered = recipes;

    if (searchTerm) {
      filtered = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const sortedFiltered = sortFavoritesFirst(filtered);

    setFilteredRecipes(sortedFiltered);
    setGroupedRecipes(groupRecipesByMissing(sortedFiltered, userProducts));
  }, [searchTerm, recipes, userProducts]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  const getProductsForIngredientLocal = (ingredientName) => {
    return products.filter(
      (product) => product.ingredientType.toLowerCase() === ingredientName.toLowerCase()
    );
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleExternalSearch = () => {
    if (!externalQuery.trim()) {
      setExternalRecipes([]);
      setExternalError(null);
      setExternalSearched(true);
      return;
    }

    setExternalLoading(true);
    setExternalError(null);
    setExternalSearched(true);

    searchExternalRecipes(externalQuery)
      .then((items) => setExternalRecipes(items))
      .catch((err) => setExternalError(err?.message || 'Greška pri učitavanju recepata.'))
      .finally(() => setExternalLoading(false));
  };

  const handleToggleFavorite = async (id) => {
    if (role !== 'user') {
      alert('Only registered users can add favorites!');
      return;
    }
    try {
      if (favoriteIds.includes(id)) {
        await removeFavoriteRecipe(id);
        setFavoriteIds((prev) => prev.filter((rid) => rid !== id));
      } else {
        await addFavoriteRecipe(id);
        setFavoriteIds((prev) => [...prev, id]);
      }
    } catch (err) {
      alert(err?.message || 'Greška pri čuvanju omiljenih.');
    }
  };

  const isIngredientInCart = (ingredientName) => {
    return cartItems.some(
      item => item.ingredientType && item.ingredientType.toLowerCase() === ingredientName.toLowerCase()
    );
  };

  const handleAddProductToCart = (product) => {
    if (role !== 'user') {
      alert('Samo registrovani korisnici mogu dodavati proizvode u korpu!');
      return;
    } 

    apiAddToCart(product.id, 1)
      .then(() => apiGetCart())
      .then((data) => {
        const normalized = data.map((ci) => ({
          id: ci.productId || ci.id,
          productId: ci.productId,
          name: ci.product?.name || ci.Product?.name || '',
          price: Number(ci.product?.price ?? ci.Product?.price ?? 0),
          image: ci.product?.imageUrl || ci.Product?.imageUrl || ci.product?.image || ci.Product?.image || '🧺',
          ingredientType: ci.product?.IngredientType?.name || ci.Product?.IngredientType?.name || '',
          totalQuantity: ci.quantity,
        }));
        setCartItems(normalized);
        alert(`${product.name} dodato u korpu!`);
        setSelectedIngredient(null);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri dodavanju u korpu.');
      });
  };

  const RecipeCard = ({ recipe }) => {
    const missingCount = countMissingIngredients(recipe, userProducts);

    return (
      <div className="recipe-card">
        <div className="recipe-image">
          <img src={recipe.image} alt={recipe.name} className="recipe-img" />
        </div>
        <div className="recipe-info">
          <h3>{recipe.name}</h3>
          <p className="recipe-description">{recipe.description}</p>
          <div className="recipe-meta">
            <span className="recipe-difficulty">
              Težina: <strong>{recipe.difficulty}</strong>
            </span>
            <span className="recipe-time">
              Vreme: <strong>{recipe.prepTime}</strong>
            </span>
            <span className={`missing-badge ${missingCount === 0 ? 'can-make' : missingCount <= 2 ? 'partial' : 'missing'}`}>
              {missingCount === 0 ? '✓ Mogu da napravim' : `${missingCount} nedostaje`}
            </span>
          </div>
          <Button
            label="Detalji"
            onClick={() => setSelectedRecipe(recipe)}
            variant="primary"
            className="view-details-btn"
          />
          {role === 'user' && (
            <Button
              label={recipe.isFavorite ? '❤️ Ukloni iz Omiljenih' : '🤍 Dodaj u Omiljene'}
              onClick={() => handleToggleFavorite(recipe.id)}
              variant={recipe.isFavorite ? 'danger' : 'secondary'}
              className="favorite-btn"
            />
          )}
        </div>
      </div>
    );
  };

  const RecipeSection = ({ title, recipes, icon }) => {
    if (recipes.length === 0) return null;

    return (
      <div className="recipe-section">
        <h3>{icon} {title} ({recipes.length})</h3>
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    );
  };

  const showSortedView = role === 'user';

  if (loading) return <div style={{ padding: 20 }}>Učitavanje recepata...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h2>Naši recepti</h2>
        <p>{showSortedView ? 'Sortirano po vašim proizvodima' : 'Pogledajte naše recepte'}</p>
      </div>

      <div className="recipes-search">
        <Input
          label="Pretraži recepte"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Unesite naziv recepta..."
          name="search"
        />
        <p className="search-results">
          Pronađeno {filteredRecipes.length} recept{filteredRecipes.length !== 1 ? 'a' : ''}
        </p>
      </div>

      <div className="recipes-container">
        {showSortedView ? (
          <>
            <RecipeSection title="Mogu da Napravim" recipes={groupedRecipes.canMakeNow} icon="✓" />
            <RecipeSection title="Nedostaje 1–2 Sastojka" recipes={groupedRecipes.missing1to2} icon="◐" />
            <RecipeSection title="Nedostaje Više od 2 Sastojka" recipes={groupedRecipes.missingMore} icon="◯" />
          </>
        ) : (
          <div className="recipe-section">
            <h3>Svi recepti ({filteredRecipes.length})</h3>
            <div className="recipes-grid">
              {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </div>
        )}

        {filteredRecipes.length === 0 && (
          <div className="no-recipes">
            <p>Nema pronađenih recepata za pretragu "{searchTerm}"</p>
            <Button label="Očisti pretragu" onClick={() => setSearchTerm('')} variant="secondary" />
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination-controls">
            <Button
              label="Prethodna"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              variant="secondary"
              disabled={page <= 1}
            />
            <span className="pagination-info">Strana {page} / {totalPages}</span>
            <Button
              label="Sledeća"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              variant="secondary"
              disabled={page >= totalPages}
            />
          </div>
        )}

        <div className="external-recipes">
          <div className="external-recipes-header">
            <h3>Ne možete da pronađete recept za hranu koju želite? Potražite ovde!</h3>
            <p>Ovi recepti će biti prikazani odvojeno i ne utiču na vaše sastojke ili korpu.</p>
          </div>

          <div className="external-recipes-search">
            <Input
              label="Pretraži recepte na internetu"
              value={externalQuery}
              onChange={(e) => {
                setExternalQuery(e.target.value);
                setExternalSearched(false);
              }}
              placeholder="Npr. pasta, chicken, salad"
              name="external-recipe-search"
            />
            <Button
              label={externalLoading ? 'Pretraživanje u toku...' : 'Pretraži'}
              onClick={handleExternalSearch}
              variant="secondary"
              disabled={externalLoading}
            />
          </div>

          {externalError && (
            <p className="external-recipes-error">{externalError}</p>
          )}

          {!externalLoading && externalSearched && externalRecipes.length === 0 && !externalError && (
            <p className="external-recipes-empty">Nema pronađenih recepata za dati kriterijum.</p>
          )}

          {externalRecipes.length > 0 && (
            <div className="external-recipes-grid">
              {externalRecipes.map((recipe) => (
                <div key={recipe.id} className="external-recipe-card">
                  <div className="external-recipe-image">
                    <img src={recipe.image} alt={recipe.name} />
                  </div>
                  <div className="external-recipe-info">
                    <h4>{recipe.name}</h4>
                    <p className="external-recipe-meta">
                      {recipe.category && <span>{recipe.category}</span>}
                      {recipe.area && <span>{recipe.area}</span>}
                    </p>
                    <div className="external-recipe-links">
                      {recipe.sourceUrl && (
                        <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                          Izvor
                        </a>
                      )}
                      {recipe.youtubeUrl && (
                        <a href={recipe.youtubeUrl} target="_blank" rel="noreferrer">
                          Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DETALJI */}
        {selectedRecipe && !selectedIngredient && (
          <div className="recipe-details-modal">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setSelectedRecipe(null)}>✕</button>
              <div className="modal-image">
                <img src={selectedRecipe.image} alt={selectedRecipe.name} className="recipe-img" />
              </div>
              <h2>{selectedRecipe.name}</h2>
              <p className="modal-description">{selectedRecipe.description}</p>

              <div className="modal-details">
                <div className="detail-item"><strong>Težina:</strong> {selectedRecipe.difficulty}</div>
                <div className="detail-item"><strong>Vreme:</strong> {selectedRecipe.prepTime}</div>
                <div className="detail-item"><strong>Ukupno Sastojaka:</strong> {selectedRecipe.ingredients.length}</div>
              </div>

              <div className="modal-nutrition" style={{ marginTop: "1rem" }}>
                <h4>Nutritivne vrednosti (ukupno za recept)</h4>
                {nutritionLoading && <p>Učitavanje nutritivnih vrednosti...</p>}
                {!nutritionLoading && nutritionError && <p style={{ color: "crimson" }}>{nutritionError}</p>}
                {!nutritionLoading && !nutritionError && nutrition?.totals && (
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    <li><strong>Kalorije:</strong> {nutrition.totals.calories} kcal</li>
                    <li><strong>Proteini:</strong> {nutrition.totals.protein} g</li>
                    <li><strong>Masti:</strong> {nutrition.totals.fat} g</li>
                    <li><strong>Ugljeni hidrati:</strong> {nutrition.totals.carbs} g</li>
                  </ul>
                )}
              </div>

              <div className="modal-ingredients">
                <h4>Sastojci:</h4>
                <ul>
                  {selectedRecipe.ingredients.map((ingredient, idx) => {
                    const hasProduct = userProducts.some(
                      product => product.ingredientType.toLowerCase() === ingredient.name.toLowerCase()
                    );
                    return (
                      <li key={idx} className={hasProduct ? 'have-ingredient' : 'missing-ingredient'}>
                        <span className={hasProduct ? '✓' : '✗'}></span>
                        {ingredient.name} - {ingredient.quantity}{ingredient.unit}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {(() => {
                const missing = findMissingIngredients(selectedRecipe, userProducts);
                return missing.length > 0 && role === 'user' ? (
                  <div className="missing-summary">
                    <h4>Nedostajući Sastojci:</h4>
                    <ul>
                      {missing.map((ingredient, idx) => {
                        const inCart = isIngredientInCart(ingredient.name);
                        return (
                          <li key={idx} style={inCart ? { opacity: 0.7 } : undefined}>
                            {ingredient.name} - {ingredient.quantity}{ingredient.unit}
                            {inCart ? (
                              <span style={{ marginLeft: '0.5rem', color: 'green' }}>✓ Proizvod je dodat u korpu</span>
                            ) : role === 'user' ? (
                              <Button label="Odaberi proizvod" onClick={() => setSelectedIngredient(ingredient)} variant="secondary" className="select-product-btn" />
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : missing.length === 0 && role === 'user' ? (
                  <div className="can-make-msg"><p>✓ Imate sve sastojke za ovaj recept!</p></div>
                ) : null;
              })()}

              <div className="modal-actions">
                <Button label="Zatvori" onClick={() => setSelectedRecipe(null)} variant="secondary" />
              </div>
            </div>
          </div>
        )}

        {selectedIngredient && (
          <div className="recipe-details-modal">
            <div className="modal-content">
              <button className="close-modal" onClick={() => setSelectedIngredient(null)}>✕</button>
              <h2>Izaberite proizvod za: {selectedIngredient.name}</h2>
              
              <div className="products-grid">
                {getProductsForIngredientLocal(selectedIngredient.name).map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">{product.image}</div>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p><strong>{product.packageAmount}</strong></p>
                      <p className="product-price">{product.price.toFixed(2)} RSD</p>
                      <Button label="Dodaj u Korpu" onClick={() => handleAddProductToCart(product)} variant="primary" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-back-button">
                <Button label="Nazad" onClick={() => setSelectedIngredient(null)} variant="secondary" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
