// frontend/src/api/orders.js
import { apiFetch } from "./client";

export async function checkout(data) {
  return apiFetch("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ADMIN
export async function adminGetOrders() {
  return apiFetch("/orders/admin", { method: "GET" });
}

export async function adminGetOrder(id) {
  return apiFetch(`/orders/admin/${id}`, { method: "GET" });
}

export async function adminUpdateOrderStatus(id, status) {
  return apiFetch(`/orders/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}