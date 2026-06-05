import { useState } from "react";

function Koszyk({ apiUrl, items, total, onChangeQuantity }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const saveCart = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      });
      const data = await res.json();
      setMessage(data.message || "Koszyk wyslany.");
    } catch {
      setMessage("Blad podczas wysylki koszyka.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <h2>Koszyk</h2>
      {items.length === 0 ? (
        <p>Dodaj produkty do koszyka.</p>
      ) : (
        <ul className="list">
          {items.map((item) => (
            <li key={item.productId} className="item">
              <span>{item.name}</span>
              <div className="qty-controls">
                <button className="btn-secondary" onClick={() => onChangeQuantity(item.productId, -1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button className="btn-secondary" onClick={() => onChangeQuantity(item.productId, 1)}>
                  +
                </button>
              </div>
              <strong>{(item.price * item.quantity).toFixed(2)} PLN</strong>
            </li>
          ))}
        </ul>
      )}
      <p className="total">Suma: {total.toFixed(2)} PLN</p>
      <button className="btn-primary" disabled={saving || items.length === 0} onClick={saveCart}>
        {saving ? "Wysylanie..." : "Wyslij koszyk"}
      </button>
      {message && <p>{message}</p>}
    </section>
  );
}

export default Koszyk;
