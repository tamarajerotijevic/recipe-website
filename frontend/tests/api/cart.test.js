import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock apiFetch iz client.js
vi.mock("../../src/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../../src/api/client";
import {
  getCart,
  addToCart,
  deleteFromCart,
  updateCartItem,
  clearCart,
} from "../../src/api/cart";

describe("cart API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("getCart poziva /cart", async () => {
    apiFetch.mockResolvedValueOnce([]);

    await getCart();

    expect(apiFetch).toHaveBeenCalledWith("/cart");
  });

  test("addToCart šalje POST na /cart sa productId i quantity", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await addToCart(10, 2);

    expect(apiFetch).toHaveBeenCalledWith("/cart", {
      method: "POST",
      body: JSON.stringify({ productId: 10, quantity: 2 }),
    });
  });

  test("addToCart default quantity = 1", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await addToCart(7);

    expect(apiFetch).toHaveBeenCalledWith("/cart", {
      method: "POST",
      body: JSON.stringify({ productId: 7, quantity: 1 }),
    });
  });

  test("deleteFromCart šalje DELETE na /cart/:productId", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await deleteFromCart(5);

    expect(apiFetch).toHaveBeenCalledWith("/cart/5", { method: "DELETE" });
  });

  test("updateCartItem šalje PATCH na /cart/:productId sa quantity", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await updateCartItem(5, 3);

    expect(apiFetch).toHaveBeenCalledWith("/cart/5", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 3 }),
    });
  });

  test("clearCart šalje DELETE na /cart", async () => {
    apiFetch.mockResolvedValueOnce({ ok: true });

    await clearCart();

    expect(apiFetch).toHaveBeenCalledWith("/cart", { method: "DELETE" });
  });
});