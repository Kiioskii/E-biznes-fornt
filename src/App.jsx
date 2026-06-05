import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Produkty from "./components/Produkty";
import Koszyk from "./components/Koszyk";
import Platnosci from "./components/Platnosci";
import ProductDetails from "./components/ProductDetails";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function App() {
  const [produkty, setProdukty] = useState([]);
  const [koszykItems, setKoszykItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const koszykTotal = useMemo(() => {
    return koszykItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [koszykItems]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) {
        throw new Error("Nie udalo sie pobrac produktow.");
      }
      const data = await res.json();
      setProdukty(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    setKoszykItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: Number(product.price), quantity: 1 }
      ];
    });
  };

  const changeQuantity = (productId, delta) => {
    setKoszykItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <BrowserRouter>
      <main className="container">
        <h1>Sklep internetowy</h1>
        <p className="subtitle">React Hooks + Kotlin backend</p>

        <nav className="nav">
          <Link to="/products">Lista produktow</Link>
          <Link to="/cart">Koszyk ({koszykItems.reduce((sum, item) => sum + item.quantity, 0)})</Link>
        </nav>

        <Routes>
          <Route
            path="/products"
            element={
              <Produkty
                produkty={produkty}
                loading={loading}
                error={error}
                onRefresh={fetchProducts}
                onAdd={addToCart}
              />
            }
          />
          <Route
            path="/products/:id"
            element={<ProductDetails produkty={produkty} onAdd={addToCart} onRefresh={fetchProducts} />}
          />
          <Route
            path="/cart"
            element={
              <div className="grid">
                <Koszyk
                  apiUrl={API_URL}
                  items={koszykItems}
                  total={koszykTotal}
                  onChangeQuantity={changeQuantity}
                />
                <Platnosci apiUrl={API_URL} total={koszykTotal} />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
