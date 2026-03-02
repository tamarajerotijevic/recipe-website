
import { useEffect, useState } from 'react';
import { DUMMY_ORDERS } from '../data';
import { createProduct, deleteProduct as apiDeleteProduct, getProducts } from '../api/products';
import { createRecipe, deleteRecipe as apiDeleteRecipe, getRecipes } from '../api/recipes';
import { getIngredientTypes } from '../api/ingredientTypes';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Admin({ role }) {
  // useState hooks za admin
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [ingredientTypes, setIngredientTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    ingredientType: '',
    packageAmount: '',
    price: '',
    image: ''
  });
  const [newRecipe, setNewRecipe] = useState({ 
    name: '', 
    description: '', 
    image: '',
    difficulty: 'Lako',
    prepTime: '',
    ingredients: []
  });
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  const fetchProducts = () => {
    setProductsLoading(true);
    return getProducts()
      .then((data) => {
        const normalized = (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          ingredientType: p.IngredientType?.name || p.ingredientType || '',
          packageAmount: p.packageAmount || '',
          price: Number(p.price || 0),
          image: p.imageUrl || p.image || '📦',
        }));
        setProducts(normalized);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri učitavanju proizvoda.');
      })
      .finally(() => setProductsLoading(false));
  };

  const fetchRecipes = () => {
    setRecipesLoading(true);
    return getRecipes()
      .then((data) => {
        const normalized = (data || []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          image: r.imageUrl || r.image || '🍽️',
          difficulty: r.difficulty || '',
          prepTime: r.prepTimeMinutes ? `${r.prepTimeMinutes} min` : '',
          ingredients: (r.RecipeIngredients || []).map((ri) => ({
            name: ri.IngredientType?.name || '',
            quantity: Number(ri.quantity || 0),
            unit: ri.unit || '',
          })),
          isFavorite: false,
        }));
        setRecipes(normalized);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri učitavanju recepata.');
      })
      .finally(() => setRecipesLoading(false));
  };

  const fetchIngredientTypes = () => {
    return getIngredientTypes()
      .then((data) => {
        const names = (data || []).map((i) => i.name).filter(Boolean);
        setIngredientTypes(names);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri učitavanju tipova sastojaka.');
      });
  };

  // Ucitaj proizvode sa API-ja
  useEffect(() => {
    if (role !== 'admin') {
      setProductsLoading(false);
      setRecipesLoading(false);
      return;
    }
    fetchProducts();
    fetchRecipes();
    fetchIngredientTypes();
  }, [role]);

  // Provera uloge
  if (role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Pristup odbijen!</h2>
          <p>Samo admiistratori mogu pristupati ovom panelu.</p>
          <p>Molimo vas da se prijavite kao administrator da biste nastavili.</p>
        </div>
      </div>
    );
  }

  // Dodavanje proizvoda
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.ingredientType || !newProduct.packageAmount || !newProduct.price || !newProduct.image) {
      alert('Molimo vas da popunite sva polja!');
      return;
    }

    const alreadyExists = products.find(
      p => p.name.toLowerCase() === newProduct.name.toLowerCase()
    );

    if (alreadyExists) {
      alert('Proizvod već postoji!');
      return;
    }

    // salji backendu
    createProduct({
      name: newProduct.name,
      ingredientType: newProduct.ingredientType,
      packageAmount: newProduct.packageAmount,
      price: parseFloat(newProduct.price),
      image: newProduct.image,
    })
      .then((created) => {
        // normalizuj proizvode za admin listu
        const p = {
          id: created.id,
          name: created.name,
          ingredientType: created.IngredientType?.name || newProduct.ingredientType,
          packageAmount: created.packageAmount,
          price: Number(created.price),
          image: created.imageUrl || created.image,
        };
        setProducts((prev) => [...prev, p]);
        setNewProduct({ name: '', ingredientType: '', packageAmount: '', price: '', image: '' });
        fetchProducts();
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri dodavanju proizvoda.');
      });
  };

  const handleDeleteProduct = (id) => {
    apiDeleteProduct(id)
      .then(() => fetchProducts())
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri brisanju proizvoda.');
      });
  };

  // Upravljanje receptima
  const handleAddIngredientToRecipe = () => {
    if (!newIngredient.name || !newIngredient.quantity || !newIngredient.unit) {
      alert('Molimo vas da popunite sva polja za sastojak!');
      return;
    }

    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, {
        name: newIngredient.name,
        quantity: parseFloat(newIngredient.quantity),
        unit: newIngredient.unit
      }]
    });
    setNewIngredient({ name: '', quantity: '', unit: '' });
  };

  const handleRemoveIngredientFromRecipe = (index) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const handleAddRecipe = () => {
    if (!newRecipe.name || !newRecipe.description || !newRecipe.image || !newRecipe.prepTime) {
      alert('Molimo vas da popunite sva polja recepte!');
      return;
    }

    if (newRecipe.ingredients.length === 0) {
      alert('Molimo vas da dodate bar jedan sastojak!');
      return;
    }

    const alreadyExists = recipes.find(
      r => r.name.toLowerCase() === newRecipe.name.toLowerCase()
    );

    if (alreadyExists) {
      alert('Recept već postoji!');
      return;
    }

    createRecipe({
      name: newRecipe.name,
      description: newRecipe.description,
      image: newRecipe.image,
      difficulty: newRecipe.difficulty,
      prepTime: newRecipe.prepTime,
      ingredients: newRecipe.ingredients,
    })
      .then((created) => {
        const r = {
          id: created.id,
          name: created.name,
          description: created.description,
          image: created.imageUrl || created.image,
          difficulty: created.difficulty,
          prepTime: created.prepTimeMinutes ? `${created.prepTimeMinutes} min` : newRecipe.prepTime,
          ingredients: (created.RecipeIngredients || []).map((ri) => ({
            name: ri.IngredientType?.name || '',
            quantity: Number(ri.quantity || 0),
            unit: ri.unit || '',
          })),
          isFavorite: false,
        };
        setRecipes((prev) => [...prev, r]);
        setNewRecipe({ 
          name: '', 
          description: '', 
          image: '',
          difficulty: 'Lako',
          prepTime: '',
          ingredients: []
        });
        fetchRecipes();
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri dodavanju recepta.');
      });
  };

  const handleDeleteRecipe = (id) => {
    apiDeleteRecipe(id)
      .then(() => fetchRecipes())
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri brisanju recepta.');
      });
  };

  // Order Management
  const handleChangeOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
         
        <h2>Administrator Panel</h2>
        <p>Uređujte proizvode, recepte i porudžbine</p>
      </div>
      

      {/* Tabovi */}
      <div className="admin-tabs">
        <Button
          label="Proizvodi"
          onClick={() => setActiveTab('products')}
          variant={activeTab === 'products' ? 'primary' : 'secondary'}
          className="tab-btn"
        />
        <Button
          label="Recepti"
          onClick={() => setActiveTab('recipes')}
          variant={activeTab === 'recipes' ? 'primary' : 'secondary'}
          className="tab-btn"
        />
        <Button
          label="Porudžbine"
          onClick={() => setActiveTab('orders')}
          variant={activeTab === 'orders' ? 'primary' : 'secondary'}
          className="tab-btn"
        />
      </div>

      {/* Proizvodi tab */}
      {activeTab === 'products' && (
        <div className="admin-section">
          <h3>Upravljanje proizvodima</h3>

          {/* Dodavanje proizvoda forma */}
          <div className="admin-form">
            <h4>Dodaj novi proizvod</h4>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <Input
                label="Naziv proizvoda (Marka + Tip)"
                name="name"
                value={newProduct.name}
                onChange={(e) => handleInputChange(e, setNewProduct)}
                placeholder="npr. Imlek Alpsko mleko 1L"
              />
              <Input
                label="Slika (emoji)"
                name="image"
                value={newProduct.image}
                onChange={(e) => handleInputChange(e, setNewProduct)}
                placeholder="npr. 🥛"
              />
              <Input
                label="Veličina paketa"
                name="packageAmount"
                value={newProduct.packageAmount}
                onChange={(e) => handleInputChange(e, setNewProduct)}
                placeholder="npr. 1L, 500g"
              />
              <Input
                label="Cena (u RSD)"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={(e) => handleInputChange(e, setNewProduct)}
                placeholder="npr. 250"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div>
                <label>Tip Sastojka:</label>
                <select
                  name="ingredientType"
                  value={newProduct.ingredientType}
                  onChange={(e) => handleInputChange(e, setNewProduct)}
                  className="input-field"
                >
                  <option value="">-- Izaberite tip sastojka --</option>
                  {ingredientTypes.map((ingredient) => (
                    <option key={ingredient} value={ingredient}>
                      {ingredient}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              label="Dodaj proizvod"
              onClick={handleAddProduct}
              variant="primary"
              style={{ width: '100%', padding: '0.75rem 1.5rem' }}
            />
          
          </div>

          {/* Lista proizvoda */}
          <div className="admin-list">
            <h4>Proizvodi ({products.length})</h4>
            {productsLoading && <p>Učitavanje proizvoda...</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Šifra</th>
                  <th>Naziv</th>
                  <th>Tip</th>
                  <th>Paket</th>
                  <th>Cena</th>
                  <th>Slika</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.ingredientType}</td>
                    <td>{product.packageAmount}</td>
                    <td>{product.price.toFixed(2)} RSD</td>
                    <td className="recipe-image">{product.image}</td>
                    <td>
                      <Button
                        label="Obriši"
                        onClick={() => handleDeleteProduct(product.id)}
                        variant="danger"
                        className="action-btn"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recepti tab */}
      {activeTab === 'recipes' && (
        <div className="admin-section">
          <h3>Upravljanje receptima</h3>

          {/* Dodavanje recepta forma */}
          <div className="admin-form">
            <h4>Dodaj novi recept</h4>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <Input
                label="Naziv recepta"
                name="name"
                value={newRecipe.name}
                onChange={(e) => handleInputChange(e, setNewRecipe)}
                placeholder="npr. Karbonara špageti"
              />
              <Input
                label="Slika (emoji)"
                name="image"
                value={newRecipe.image}
                onChange={(e) => handleInputChange(e, setNewRecipe)}
                placeholder="Dodajte sliku"
              />
              <div>
                <label>Težina:</label>
                <select 
                  name="difficulty"
                  value={newRecipe.difficulty}
                  onChange={(e) => handleInputChange(e, setNewRecipe)}
                  className="input-field"
                >
                  <option value="Lako">Lako</option>
                  <option value="Srednja">Srednja</option>
                  <option value="Teško">Teško</option>
                </select>
              </div>
              <Input
                label="Vreme pripreme"
                name="prepTime"
                value={newRecipe.prepTime}
                onChange={(e) => handleInputChange(e, setNewRecipe)}
                placeholder="npr. 20 minuta"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <Input
                label="Opis"
                name="description"
                value={newRecipe.description}
                onChange={(e) => handleInputChange(e, setNewRecipe)}
                placeholder="npr. Klasičan italijanski recept..."
              />
            </div>

            {/* Sekcija sa sastojcima */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #ecf0f1' }}>
              <h5 style={{ marginBottom: '1rem' }}>Dodaj Sastojke</h5>
              
              {/* Ingredient Input Row */}
              <div className="admin-ingredients-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Naziv Sastojka</label>
                  <select
                    name="ingredientName"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Izaberite sastojak --</option>
                    {ingredientTypes.map((ingredient) => (
                      <option key={ingredient} value={ingredient}>
                        {ingredient}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Količina"
                  name="ingredientQuantity"
                  type="number"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                  placeholder="npr. 400"
                />
                <div className="admin-ingredient-field">
                  <label>Jedinica</label>
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Izaberite jedinicu --</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="komadi">komadi</option>
                  </select>
                </div>
                <div className="admin-ingredient-action" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    label="Dodaj Sastojak"
                    onClick={handleAddIngredientToRecipe}
                    variant="secondary"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Prikaz dodatih sastojaka */}
              {newRecipe.ingredients.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ marginBottom: '0.75rem' }}>Dodati Sastojci ({newRecipe.ingredients.length}):</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', background: '#f9f9f9', padding: '1rem', borderRadius: '5px' }}>
                    {newRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'white', borderRadius: '4px', border: '1px solid #ecf0f1' }}>
                        <span style={{ flex: 1 }}><strong>{ingredient.name}</strong> - {ingredient.quantity} {ingredient.unit}</span>
                        <Button
                          label="Ukloni"
                          onClick={() => handleRemoveIngredientFromRecipe(index)}
                          variant="danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              label="Dodaj recept"
              onClick={handleAddRecipe}
              variant="primary"
              style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem 1.5rem' }}
            />
            </div>
        

          {/* Lista recepata */}
          <div className="admin-list">
            <h4>Recepti ({recipes.length})</h4>
            {recipesLoading && <p>Učitavanje recepata...</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Šifra</th>
                  <th>Naziv</th>
                  <th>Slika</th>
                  <th>Opis</th>
                  <th>Vreme</th>
                  <th>Težina</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr key={recipe.id}>
                    <td>{recipe.id}</td>
                    <td>{recipe.name}</td>
                    <td className="recipe-image">{recipe.image}</td>
                    <td>{recipe.description.substring(0, 30)}...</td>
                    <td>{recipe.prepTime}</td>
                    <td>{recipe.difficulty}</td>
                    <td>
                      <Button
                        label="Obriši"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        variant="danger"
                        className="action-btn"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Porudžbine tab */}
      {activeTab === 'orders' && (
        <div className="admin-section">
          <h3>Upravljanje porudžbinama</h3>
          <div className="admin-list">
            <h4>Porudžbine ({orders.length})</h4>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Šifra porudžbine</th>
                  <th>Kupac</th>
                  <th>Datum</th>
                  <th>Plaćeno</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.total.toFixed(2)} RSD</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeOrderStatus(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Pending">Na čekanju</option>
                        <option value="Shipped">Poslato</option>
                        <option value="Delivered">Isporučenno</option>
                        <option value="Cancelled">Otkazano</option>
                      </select>
                    </td>
                    <td>
                      <Button
                        label="Pregledaj"
                        onClick={() => alert(`Order #${order.id} - ${order.customer}`)}
                        variant="secondary"
                        className="action-btn"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
