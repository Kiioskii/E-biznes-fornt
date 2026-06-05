import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Platnosci from "./Platnosci";

describe("Platnosci", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renderuje formularz i kwote do zaplaty", () => {
    render(<Platnosci apiUrl="http://localhost:8080/api" total={199.5} />);

    expect(screen.getByPlaceholderText("Imie i nazwisko")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Adres")).toBeInTheDocument();
    expect(screen.getByText("Do zaplaty: 199.50 PLN")).toBeInTheDocument();
  });

  it("aktualizuje pola formularza", async () => {
    const user = userEvent.setup();
    render(<Platnosci apiUrl="http://localhost:8080/api" total={0} />);

    await user.type(screen.getByPlaceholderText("Imie i nazwisko"), "Jan Kowalski");
    await user.type(screen.getByPlaceholderText("Email"), "jan@example.com");
    await user.type(screen.getByPlaceholderText("Adres"), "ul. Testowa 1");

    expect(screen.getByDisplayValue("Jan Kowalski")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jan@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ul. Testowa 1")).toBeInTheDocument();
  });

  it("wysyla platnosc do API", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      json: async () => ({ message: "Platnosc przyjeta." })
    });

    render(<Platnosci apiUrl="http://localhost:8080/api" total={99.99} />);

    await user.type(screen.getByPlaceholderText("Imie i nazwisko"), "Jan Kowalski");
    await user.type(screen.getByPlaceholderText("Email"), "jan@example.com");
    await user.type(screen.getByPlaceholderText("Adres"), "ul. Testowa 1");
    await user.click(screen.getByRole("button", { name: "Zaplac" }));

    await waitFor(() => {
      expect(screen.getByText("Platnosc przyjeta.")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Jan Kowalski",
        email: "jan@example.com",
        address: "ul. Testowa 1",
        amount: 99.99
      })
    });
  });

  it("pokazuje domyslna wiadomosc gdy API nie zwraca message", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({ json: async () => ({}) });

    render(<Platnosci apiUrl="http://localhost:8080/api" total={50} />);

    await user.type(screen.getByPlaceholderText("Imie i nazwisko"), "Jan Kowalski");
    await user.type(screen.getByPlaceholderText("Email"), "jan@example.com");
    await user.type(screen.getByPlaceholderText("Adres"), "ul. Testowa 1");
    await user.click(screen.getByRole("button", { name: "Zaplac" }));

    await waitFor(() => {
      expect(screen.getByText("Platnosc zapisana.")).toBeInTheDocument();
    });
  });

  it("pokazuje blad gdy platnosc sie nie powiedzie", async () => {
    const user = userEvent.setup();
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(<Platnosci apiUrl="http://localhost:8080/api" total={50} />);

    await user.type(screen.getByPlaceholderText("Imie i nazwisko"), "Jan Kowalski");
    await user.type(screen.getByPlaceholderText("Email"), "jan@example.com");
    await user.type(screen.getByPlaceholderText("Adres"), "ul. Testowa 1");
    await user.click(screen.getByRole("button", { name: "Zaplac" }));

    await waitFor(() => {
      expect(screen.getByText("Blad podczas platnosci.")).toBeInTheDocument();
    });
  });
});
