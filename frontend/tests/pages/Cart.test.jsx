import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";

// --- mock navigate ---
let mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// --- mock API pozivi ---
const mockDeleteFromCart = vi.fn();
const mockUpdateCartItem = vi.fn();
const mockClearCart = vi.fn();
vi.mock("../../src/api/cart", () => ({
  deleteFromCart: (...args) => mockDeleteFromCart(...args),
  updateCartItem: (...args) => mockUpdateCartItem(...args),
  clearCart: (...args) => mockClearCart(...args),
}));

const mockCheckout = vi.fn();
vi.mock("../../src/api/orders", () => ({
  checkout: (...args) => mockCheckout(...args),
}));

import Cart from "../../src/pages/Cart";

beforeEach(() => {
  mockNavigate = vi.fn();

  mockDeleteFromCart.mockReset();
  mockUpdateCartItem.mockReset();
  mockClearCart.mockReset();
  mockCheckout.mockReset();

  // da ne iskaču alert box-evi u testu
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

function renderCart(props) {
  return render(<Cart {...props} />);
}

describe("Cart stranica", () => {
  test("ako role nije 'user' prikazuje 'Pristup odbijen!'", () => {
    renderCart({
      role: "guest",
      cartItems: [],
      setCartItems: vi.fn(),
    });

    expect(screen.getByText("Pristup odbijen!")).toBeInTheDocument();
    expect(
      screen.getByText(/Samo registrovani korisnici/i)
    ).toBeInTheDocument();
  });

  test("prazna korpa: prikazuje poruku i klik na 'Proizvodi' vodi na /products", async () => {
    const user = userEvent.setup();

    renderCart({
      role: "user",
      cartItems: [],
      setCartItems: vi.fn(),
    });

    expect(screen.getByText(/Vaša korpa je prazna/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Proizvodi" }));
    expect(mockNavigate).toHaveBeenCalledWith("/products");
  });

  test("korpa sa proizvodima: prikazuje tabelu i ukupnu cenu", () => {
    const items = [
      { id: 1, name: "Mleko", price: 100, totalQuantity: 2 }, // 200
      { id: 2, name: "Hleb", price: 80, totalQuantity: 1 },   // 80
    ];

    renderCart({
      role: "user",
      cartItems: items,
      setCartItems: vi.fn(),
    });

    expect(screen.getByText(/Proizvodi u korpi \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ukupna cena:/i)).toBeInTheDocument();
    expect(screen.getByText("280.00 RSD")).toBeInTheDocument();
  });

  test("klik na 'Isprazni korpu' zove clearCart i setCartItems([])", async () => {
    const user = userEvent.setup();
    const setCartItems = vi.fn();

    mockClearCart.mockResolvedValueOnce({ ok: true });

    renderCart({
      role: "user",
      cartItems: [{ id: 1, name: "Mleko", price: 100, totalQuantity: 2 }],
      setCartItems,
    });

    await user.click(screen.getByRole("button", { name: "Isprazni korpu" }));

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalledTimes(1);
      expect(setCartItems).toHaveBeenCalledWith([]);
    });
  });

  test("klik na '+' povećava količinu: zove updateCartItem i setCartItems sa novom količinom", async () => {
    const user = userEvent.setup();
    const setCartItems = vi.fn();

    const items = [{ id: 1, name: "Mleko", price: 100, totalQuantity: 2 }];
    mockUpdateCartItem.mockResolvedValueOnce({ ok: true });

    renderCart({
      role: "user",
      cartItems: items,
      setCartItems,
    });

    // u tvojoj tabeli ima dugme "+" sa tekstom "+"
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    await user.click(plusButtons[0]);

    await waitFor(() => {
      expect(mockUpdateCartItem).toHaveBeenCalledWith(1, 3);
      expect(setCartItems).toHaveBeenCalledWith([
        { id: 1, name: "Mleko", price: 100, totalQuantity: 3 },
      ]);
    });
  });

  test("klik na '-' kada je količina 1 briše proizvod: zove deleteFromCart i setCartItems(filter)", async () => {
    const user = userEvent.setup();
    const setCartItems = vi.fn();

    const items = [
      { id: 1, name: "Mleko", price: 100, totalQuantity: 1 },
      { id: 2, name: "Hleb", price: 80, totalQuantity: 1 },
    ];

    mockDeleteFromCart.mockResolvedValueOnce({ ok: true });

    renderCart({
      role: "user",
      cartItems: items,
      setCartItems,
    });

    const minusButtons = screen.getAllByRole("button", { name: "-" });
    await user.click(minusButtons[0]); // smanjuje Mleko 1 -> 0 => remove

    await waitFor(() => {
      expect(mockDeleteFromCart).toHaveBeenCalledWith(1);
      expect(setCartItems).toHaveBeenCalledWith([
        { id: 2, name: "Hleb", price: 80, totalQuantity: 1 },
      ]);
    });
  });

  test("Plaćanje: ako checkout vrati PAID, korpa se prazni", async () => {
    const user = userEvent.setup();
    const setCartItems = vi.fn();

    mockCheckout.mockResolvedValueOnce({
      message: "Uspešno plaćanje",
      paymentStatus: "PAID",
    });

    renderCart({
      role: "user",
      cartItems: [{ id: 1, name: "Mleko", price: 100, totalQuantity: 2 }],
      setCartItems,
    });

    await user.click(screen.getByRole("button", { name: "Plaćanje" }));

    await waitFor(() => {
      expect(mockCheckout).toHaveBeenCalledTimes(1);
      expect(setCartItems).toHaveBeenCalledWith([]);
    });
  });
});