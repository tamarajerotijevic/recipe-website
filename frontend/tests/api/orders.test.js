import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock apiFetch
vi.mock("../../src/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../../src/api/client";
import { checkout } from "../../src/api/orders";

describe("orders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("checkout šalje POST zahtev na /orders/checkout", async () => {
    apiFetch.mockResolvedValueOnce({
      message: "Uspešno plaćanje",
      paymentStatus: "PAID",
    });

    await checkout();

    expect(apiFetch).toHaveBeenCalledWith("/orders/checkout", {
      method: "POST",
    });
  });

  test("checkout vraća odgovor servera", async () => {
    const mockResponse = {
      message: "Uspešno plaćanje",
      paymentStatus: "PAID",
    };

    apiFetch.mockResolvedValueOnce(mockResponse);

    const result = await checkout();

    expect(result).toEqual(mockResponse);
  });
});