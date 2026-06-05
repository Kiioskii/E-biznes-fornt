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
});
