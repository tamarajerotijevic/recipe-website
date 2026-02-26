
import { useState } from 'react';
import { deleteFromCart as apiDeleteFromCart, updateCartItem as apiUpdateCartItem, clearCart as apiClearCart } from '../api/cart';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { checkout as apiCheckout } from '../api/orders';

export default function Cart({ role, cartItems, setCartItems }) {
  const navigate = useNavigate();
  // Handle remove item from cart
  const handleRemoveFromCart = (id) => {
    // call backend then update local state
    apiDeleteFromCart(id)
      .then(() => setCartItems(cartItems.filter(item => item.id !== id)))
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri brisanju iz korpe.');
      });
  };

  // Azuriranje količine proizvoda u korpi
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    // ažuriranje backend-a pa ažuriranje lokalnog stanja
    apiUpdateCartItem(id, newQuantity)
      .then(() => setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, totalQuantity: newQuantity } : item
      )))
      .catch((err) => {
        console.error(err);
        alert(err?.message || 'Greška pri ažuriranju količine.');
      });
  };

  // Izračunavanje ukupne cene
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.totalQuantity, 0);
  };

  const handleCheckout = async () => {
  try {
    const result = await apiCheckout({
      paymentMethod: "CARD",
      simulate: "success", 
      deliveryAddress: "Test adresa 12",
    });

    alert(result.message);

    // Ako je uspešno, isprazni korpu
    if (result.paymentStatus === "PAID") {
      setCartItems([]);
    }

  } catch (err) {
    console.error(err);
    alert(err.message || "Greška pri plaćanju.");
  }
};

  // Provera uloge
  if (role !== 'user') {
    return (
      <div className="cart-page">
        <div className="access-denied">
          <h2>Pristup odbijen!</h2>
          <p>Samo registrovani korisnici mogu da pregledaju i uređuju korpu.</p>
          <p>Molimo vas da se prijavite da bi ste nastavili.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Korpa</h2>
        <p>Vaši proizvodi</p>
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cartItems.length > 0 ? (
          <>
            <h3>Proizvodi u korpi ({cartItems.length})</h3>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th>Cena</th>
                  <th>Količina</th>
                  <th>Ukupno</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="cart-item">
                    <td>{item.name}</td>
                    <td>{item.price.toFixed(2)} RSD</td>
                    <td>
                      <div className="quantity-control">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.totalQuantity - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.totalQuantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="qty-input"
                          min="1"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.totalQuantity + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{(item.price * item.totalQuantity).toFixed(2)} RSD</td>
                    <td>
                      <Button
                        label="Remove"
                        onClick={() => handleRemoveFromCart(item.id)}
                        variant="danger"
                        className="remove-btn"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Ukupno */}
            <div className="cart-summary">
              <div className="summary-item">
                <strong>Ukupan broj proizvoda:</strong> {cartItems.length}
              </div>
              {/*<div className="summary-item">
                <strong>Ukupna količina:</strong> {cartItems.reduce((sum, item) => sum + item.totalQuantity, 0)}
              </div>*/}
              <div className="summary-total">
                <strong>Ukupna cena:</strong> {calculateTotal().toFixed(2)} RSD
              </div>
            </div>

            {/* Akcije korpe */}
                        <div className="cart-actions">
              <Button
                label="Isprazni korpu"
                onClick={() => {
                  apiClearCart()
                    .then(() => setCartItems([]))
                    .catch((err) => {
                      console.error(err);
                      alert(err?.message || 'Greška pri čišćenju korpe.');
                    });
                }}
                variant="danger"
              />
              <Button
                label="Plaćanje"
                onClick={handleCheckout}
                variant="primary"
              />
            </div>
          </>
        ) : (
          <div className="empty-cart">
            <p>Vaša korpa je prazna</p>
            <p>Idite na stranicu recepata i izaberite nedostajuće sastojke!</p>
            <Button
              label="Proizvodi"
              onClick={() => navigate('/products')}
              variant="primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
