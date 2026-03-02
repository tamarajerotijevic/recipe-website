import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Products from "./pages/Products";
import Ingredients from "./pages/Ingredients";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import "./styles/main.css";
import { useAuth } from "./context/AuthContext";
import { getCart as apiGetCart } from "./api/cart";

export default function App() {
  const { user } = useAuth();
  const role = user?.role ?? "guest";

  // Moji proizvodi - Ingredients
  const [userProducts, setUserProducts] = useState([]);
  // Cart items
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    apiGetCart()
      .then((data) => {
        const normalized = data.map((ci) => ({
          id: ci.productId || ci.id,
          productId: ci.productId,
          name: ci.product?.name || ci.Product?.name || '',
          price: Number(ci.product?.price ?? ci.Product?.price ?? 0),
          image: ci.product?.imageUrl || ci.Product?.imageUrl || ci.product?.image || ci.Product?.image || '🧺',
          totalQuantity: ci.quantity,
        }));
        setCartItems(normalized);
      })
      .catch((err) => console.error('Failed to load cart', err));
  }, [user]);

  return (
    <>
      <Navbar role={role} userName={user?.name || user?.username || ""} />


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes role={role} userProducts={userProducts} cartItems={cartItems} setCartItems={setCartItems} />} />
        <Route path="/products" element={<Products role={role} cartItems={cartItems} setCartItems={setCartItems} />} />

        <Route
          path="/ingredients"
          element={
            <Ingredients
              role={role}
              userProducts={userProducts}
              setUserProducts={setUserProducts}
            />
          }
        />

        <Route path="/cart" element={<Cart role={role} cartItems={cartItems} setCartItems={setCartItems} />} />

        <Route path="/admin" element={<Admin role={role} />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
