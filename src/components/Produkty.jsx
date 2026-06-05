import { Link } from "react-router-dom";

function Produkty({ produkty, loading, error, onRefresh, onAdd }) {
  return (
    <section className="card">
      <h2>Produkty</h2>
      <button onClick={onRefresh} className="btn-secondary">Odswiez</button>

      {loading && <p>Ladowanie...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="list">
        {produkty.map((produkt) => (
          <li key={produkt.id} className="item">
            <div>
              <Link to={`/products/${produkt.id}`} className="product-link">
                <strong>{produkt.name}</strong>
              </Link>
              <p>{produkt.description}</p>
              <small>{produkt.price} PLN</small>
            </div>
            <button className="btn-primary" onClick={() => onAdd(produkt)}>
              Dodaj
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Produkty;
