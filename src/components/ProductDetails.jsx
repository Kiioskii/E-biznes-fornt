import { Link, useParams } from "react-router-dom";

function ProductDetails({ produkty, onAdd, onRefresh }) {
  const { id } = useParams();
  const productId = Number(id);
  const produkt = produkty.find((item) => item.id === productId);

  if (!produkt) {
    return (
      <section className="card">
        <h2>Podglad produktu</h2>
        <p>Nie znaleziono produktu. Odswiez liste i sprobuj ponownie.</p>
        <button className="btn-secondary" onClick={onRefresh}>
          Odswiez produkty
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>{produkt.name}</h2>
      <p className="description">{produkt.description}</p>
      <p><strong>Cena:</strong> {produkt.price} PLN</p>
      <div className="actions">
        <button className="btn-primary" onClick={() => onAdd(produkt)}>
          Dodaj do koszyka
        </button>
        <Link className="btn-secondary link-btn" to="/products">
          Powrot do listy
        </Link>
      </div>
    </section>
  );
}

export default ProductDetails;
