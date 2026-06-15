const form = document.querySelector("#login-form");
const statusEl = document.querySelector("#login-status");
const passwordInput = form.elements.password;
const queryPassword = new URLSearchParams(window.location.search).get("password");

if (queryPassword) {
  passwordInput.value = queryPassword;
  window.history.replaceState({}, "", "/admin/login");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Kontrol ediliyor...";
  const password = new FormData(form).get("password");

  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  const result = await response.json();
  if (!response.ok) {
    statusEl.textContent = result.error || "Giriş yapılamadı.";
    return;
  }

  window.location.href = "/admin";
});
