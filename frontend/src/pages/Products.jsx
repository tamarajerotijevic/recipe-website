import { useState, useEffect } from 'react';
import { getProductsPaged } from '../api/products';
import { addToCart as apiAddToCart, getCart as apiGetCart } from '../api/cart';
import { getIngredientTypes } from '../api/ingredientTypes';
import Input from '../components/Input';
import Button from '../components/Button';

const EMPTY_ARRAY = [];
const PAGE_LIMIT = 12;

export default function Products({ role = 'guest', cartItems = EMPTY_ARRAY, setCartItems = () => {} }) {
  const [products, setProducts] = useState([]);
  const [ingredientTypes, setIngredientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const normalizeProduct = (product) => ({
    ...product,
    ingredientType: product.IngredientType?.name || product.ingredientType || '',
    image: product.imageUrl || product.image || '🧺',
    price: Number(product.price || 0),
  });

  useEffect(() => {
    getIngredientTypes()
      .then((data) => {
        const names = (data || []).map((t) => t.name).filter(Boolean);
        setIngredientTypes(names);
      })
      .catch(() => setIngredientTypes([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProductsPaged({ page, limit: PAGE_LIMIT })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        const normalized = items.map(normalizeProduct);
        setProducts(normalized);
        setFilteredProducts(normalized);
        setIngredientTypes((prev) =>
          prev.length > 0 ? prev : Array.from(new Set(normalized.map((p) => p.ingredientType))).filter(Boolean)
        );
        setTotalPages(data?.pagination?.totalPages || 1);
      })
      .catch((err) => setError(err?.message || 'Greška pri učitavanju proizvoda.'))
      .finally(() => setLoading(false));
  }, [page]);

  // useEffect za filtriranje proizvoda na osnovu searchTerm i selectedIngredientFilter
  useEffect(() => {
    let filtered = products;

    // Filter po tipu sastojka
    if (selectedIngredientFilter) {
      filtered = filtered.filter(
        p => p.ingredientType === selectedIngredientFilter
      );
    }

    // Filter po terminu pretrage
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ingredientType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedIngredientFilter, products]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages || 1);
    }
  }, [page, totalPages]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Dodaj proizvod u korpu
  const handleAddProductToCart = (product) => {
    if (role !== 'user') {
      alert('Samo registrovani korisnici mogu dodati proizvode u korpu!');
      return;
    }

    // send to backend and refresh cart from server
    apiAddToCart(product.id, 1)
      .then(() => apiGetCart())
      .then((data) => {
        // normalize server cart items to frontend shape
        const normalized = data.map((ci) => ({
          id: ci.productId || ci.id,
          productId: ci.productId,
          name: ci.product?.name || ci.Product?.name || '',
          price: Number(ci.product?.price ?? ci.Product?.price ?? 0),
          image: ci.product?.imageUrl || ci.Product?.imageUrl || ci.product?.image || ci.Product?.image || '🧺',
          totalQuantity: ci.quantity,
        }));
        setCartItems(normalized);
        alert(`${product.name} je dodat u korpu!`);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri dodavanju u korpu.');
      });
  };

  // Prikaz kartice proizvoda
  const ProductCard = ({ product }) => {
    return (
      <div className="product-card">
        <div className="product-image">
          {product.image?.startsWith('http') ? (
            <img src={product.image} alt={product.name} className="product-img" />
          ) : (
            product.image
          )}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-ingredient">
            <strong>Tip:</strong> {product.ingredientType}
          </p>
          <p className="product-package">
            <strong>Paket:</strong> {product.packageAmount}
          </p>
          <p className="product-price">{product.price.toFixed(2)} RSD</p>
          {role === 'user' && (
            <Button
              label="Dodaj u Korpu"
              onClick={() => handleAddProductToCart(product)}
              variant="success"
              className="add-to-cart-btn"
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Učitavanje proizvoda...</div>;
  }

  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Katalog proizvoda</h2>
        <p>Pregledajte naše dostupne proizvode</p>
      </div>

      {/* Pretraga i filtriranje */}
      <div className="products-search">
        <Input
          label="Pretraži proizvode"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Unesite naziv ili tip..."
          name="search"
        />

        <div className="filter-section">
          <label htmlFor="ingredient-filter">Filtriraj po tipu:</label>
          <select
            id="ingredient-filter"
            value={selectedIngredientFilter}
            onChange={(e) => setSelectedIngredientFilter(e.target.value)}
            className="input-field"
          >
            <option value="">-- Svi proizvodi --</option>
            {ingredientTypes.map((ingredient) => (
              <option key={ingredient} value={ingredient}>
                {ingredient}
              </option>
            ))}
          </select>
        </div>

        <p className="search-results">
          Pronađeno {filteredProducts.length} proizvod{filteredProducts.length !== 1 ? 'a' : ''}
        </p>
      </div>

      {/* Mreža proizvoda */}
      <div className="products-container">
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>Nema pronađenih proizvoda sa vašim kriterijumima pretrage</p>
            {searchTerm && (
              <Button
                label="Očisti pretragu"
                onClick={() => setSearchTerm('')}
                variant="secondary"
              />
            )}
            {selectedIngredientFilter && (
              <Button
                label="Očisti filter"
                onClick={() => setSelectedIngredientFilter('')}
                variant="secondary"
              />
            )}
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
      </div>
    </div>
  );
}
