import { useState } from "react";

function Platnosci({ apiUrl, total }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: ""
  });
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(total.toFixed(2))
        })
      });
      const data = await res.json();
      setMessage(data.message || "Platnosc zapisana.");
    } catch {
      setMessage("Blad podczas platnosci.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="card">
      <h2>Platnosci</h2>
      <form onSubmit={submitPayment} className="form">
        <input
          type="text"
          name="fullName"
          placeholder="Imie i nazwisko"
          value={form.fullName}
          onChange={onChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Adres"
          value={form.address}
          onChange={onChange}
          required
        />
        <p>Do zaplaty: {total.toFixed(2)} PLN</p>
        <button type="submit" className="btn-primary" disabled={processing}>
          {processing ? "Przetwarzanie..." : "Zaplac"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}

export default Platnosci;
