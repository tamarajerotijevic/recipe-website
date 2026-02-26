export async function checkout(data) {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3001/api/orders/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Greška pri plaćanju.");
  }

  return result;
}