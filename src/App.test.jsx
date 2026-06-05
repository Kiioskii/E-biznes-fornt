import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";

const produkty = [
  { id: 1, name: "Laptop", description: "Opis laptopa", price: 100 },
  { id: 2, name: "Mysz", description: "Opis myszy", price: 50 }
];

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/products");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => produkty
      })
    );
  });

  it("pobiera i wyswietla produkty", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    expect(screen.getByText("Mysz")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/products");
  });

  it("dodaje produkt do koszyka i aktualizuje licznik", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: "Dodaj" });
    await user.click(addButtons[0]);
    await user.click(addButtons[0]);

    expect(screen.getByRole("link", { name: "Koszyk (2)" })).toBeInTheDocument();
  });

  it("pokazuje blad gdy pobieranie produktow sie nie powiedzie", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Nie udalo sie pobrac produktow.")).toBeInTheDocument();
    });
  });

  it("pokazuje blad gdy fetch rzuca wyjatek", async () => {
    fetch.mockRejectedValueOnce(new Error("Brak polaczenia"));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Brak polaczenia")).toBeInTheDocument();
    });
  });

  it("wyswietla koszyk i zmienia ilosc produktow", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: "Dodaj" })[0]);
    await user.click(screen.getByRole("link", { name: "Koszyk (1)" }));

    expect(screen.getByRole("heading", { name: "Koszyk" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Platnosci" })).toBeInTheDocument();
    expect(screen.getByText("Suma: 100.00 PLN")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("Suma: 200.00 PLN")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("Suma: 100.00 PLN")).toBeInTheDocument();
  });

  it("dodaje rozne produkty i zwieksza ilosc istniejacego w koszyku", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: "Dodaj" });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    await user.click(addButtons[0]);

    expect(screen.getByRole("link", { name: "Koszyk (3)" })).toBeInTheDocument();
  });

  it("zmienia ilosc tylko wybranego produktu w koszyku z wieloma pozycjami", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole("button", { name: "Dodaj" });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    await user.click(screen.getByRole("link", { name: "Koszyk (2)" }));

    expect(screen.getByText("Suma: 150.00 PLN")).toBeInTheDocument();

    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);

    expect(screen.getByText("Suma: 250.00 PLN")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Koszyk (3)" })).toBeInTheDocument();
  });

  it("przekierowuje nieznana sciezke do listy produktow", async () => {
    window.history.pushState({}, "", "/nieznana-sciezka");
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Produkty" })).toBeInTheDocument();
    });
  });

  it("usuwa produkt z koszyka gdy ilosc spadnie do zera", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("button", { name: "Dodaj" })[0]);
    await user.click(screen.getByRole("link", { name: "Koszyk (1)" }));
    await user.click(screen.getByRole("button", { name: "-" }));

    expect(screen.getByText("Dodaj produkty do koszyka.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Koszyk (0)" })).toBeInTheDocument();
  });
});
