const state = {
  db: null,
  collection: "services"
};

const collectionLabels = {
  services: "Hizmet",
  products: "Ürün",
  cases: "Referans",
  faqs: "SSS"
};

const collectionSelect = document.querySelector("#collection-select");
const contentForm = document.querySelector("#content-form");
const settingsForm = document.querySelector("#settings-form");
const contactForm = document.querySelector("#contact-form");
const contentList = document.querySelector("#content-list");
const leadsBody = document.querySelector("#leads-body");
const contentStatus = document.querySelector("#content-status");
const settingsStatus = document.querySelector("#settings-status");
const contactStatus = document.querySelector("#contact-status");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (response.status === 401) {
    window.location.href = "/admin/login";
    return null;
  }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "İşlem başarısız");
  return result;
}

function setFieldVisibility() {
  const type = state.collection;
  document.querySelectorAll(".field-services, .field-products, .field-cases").forEach((item) => item.classList.add("hidden"));
  if (type === "services") document.querySelectorAll(".field-services").forEach((item) => item.classList.remove("hidden"));
  if (type === "products") document.querySelectorAll(".field-products").forEach((item) => item.classList.remove("hidden"));
  if (type === "cases") document.querySelectorAll(".field-cases").forEach((item) => item.classList.remove("hidden"));
}

function resetContentForm() {
  contentForm.reset();
  contentForm.elements.id.value = "";
  contentForm.elements.active.checked = true;
  contentStatus.textContent = `${collectionLabels[state.collection]} eklemeye hazır.`;
  setFieldVisibility();
}

function renderMetrics() {
  const activeCount = ["services", "products", "cases", "faqs"].reduce(
    (sum, key) => sum + (state.db[key] || []).filter((item) => item.active !== false).length,
    0
  );
  document.querySelector("#metric-leads").textContent = String((state.db.leads || []).length);
  document.querySelector("#metric-content").textContent = String(activeCount);
  document.querySelector("#metric-video").textContent = state.db.settings?.videoUrl ? "Var" : "Yok";
}

function renderLeads() {
  const leads = state.db.leads || [];
  if (!leads.length) {
    leadsBody.innerHTML = `<tr><td colspan="6">Henüz demo talebi yok.</td></tr>`;
    return;
  }

  leadsBody.innerHTML = leads.map((lead) => `
    <tr>
      <td>${escapeHtml(new Date(lead.createdAt).toLocaleString("tr-TR"))}</td>
      <td>${escapeHtml(lead.name)}</td>
      <td><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td>
      <td>${escapeHtml(lead.interest)}</td>
      <td>${escapeHtml(lead.message)}</td>
      <td>
        <select data-lead-status="${escapeHtml(lead.id)}">
          ${["new", "contacted", "won", "lost"].map((status) => `<option value="${status}" ${lead.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </td>
    </tr>
  `).join("");
}

function itemTitle(item) {
  return item.title || item.question || "Başlıksız";
}

function itemSummary(item) {
  return item.summary || item.answer || item.problem || "";
}

function renderContentList() {
  const items = state.db[state.collection] || [];
  if (!items.length) {
    contentList.innerHTML = `<div class="content-row"><strong>Bu bölüm boş.</strong></div>`;
    return;
  }

  contentList.innerHTML = items.map((item) => `
    <div class="content-row">
      <div>
        <strong>${escapeHtml(itemTitle(item))}</strong>
        <small>${item.active === false ? "Pasif" : "Aktif"} - ${escapeHtml(itemSummary(item)).slice(0, 160)}</small>
      </div>
      <div class="row-actions">
        <button class="mini-button" type="button" data-edit="${escapeHtml(item.id)}">Düzenle</button>
        <button class="mini-button danger" type="button" data-delete="${escapeHtml(item.id)}">Sil</button>
      </div>
    </div>
  `).join("");
}

function fillContentForm(id) {
  const item = (state.db[state.collection] || []).find((entry) => entry.id === id);
  if (!item) return;
  resetContentForm();
  contentForm.elements.id.value = item.id;
  contentForm.elements.title.value = item.title || item.question || "";
  contentForm.elements.summary.value = item.summary || item.answer || "";
  contentForm.elements.items.value = Array.isArray(item.items) ? item.items.join("\n") : "";
  contentForm.elements.usage.value = item.usage || "";
  contentForm.elements.benefits.value = item.benefits || "";
  contentForm.elements.problem.value = item.problem || "";
  contentForm.elements.solution.value = item.solution || "";
  contentForm.elements.result.value = item.result || "";
  contentForm.elements.active.checked = item.active !== false;
  contentStatus.textContent = "Düzenleme modu açık.";
  contentForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderSettings() {
  settingsForm.elements.videoTitle.value = state.db.settings.videoTitle || "";
  settingsForm.elements.videoSubtitle.value = state.db.settings.videoSubtitle || "";
  settingsForm.elements.videoUrl.value = state.db.settings.videoUrl || "";
  settingsForm.elements.videoCtaLabel.value = state.db.settings.videoCtaLabel || "Demo talep et";
}

function renderContact() {
  const contact = state.db.contact || {};
  contactForm.elements.phone.value = contact.phone || "";
  contactForm.elements.email.value = contact.email || "";
  contactForm.elements.whatsapp.value = contact.whatsapp || "";
  contactForm.elements.address.value = contact.address || "";
  contactForm.elements.linkedin.value = contact.linkedin || "";
  contactForm.elements.instagram.value = contact.instagram || "";
  contactForm.elements.website.value = contact.website || "";
}

function renderAll() {
  renderMetrics();
  renderLeads();
  setFieldVisibility();
  renderContentList();
  renderSettings();
  renderContact();
}

async function loadDashboard() {
  state.db = await api("/api/admin/dashboard");
  if (!state.db) return;
  renderAll();
}

contentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(contentForm).entries());
  data.active = contentForm.elements.active.checked;
  data.items = contentForm.elements.items.value;

  if (state.collection === "faqs") {
    data.question = data.title;
    data.answer = data.summary;
  }

  try {
    const id = data.id;
    const path = id ? `/api/admin/${state.collection}/${encodeURIComponent(id)}` : `/api/admin/${state.collection}`;
    await api(path, { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
    contentStatus.textContent = "İçerik kaydedildi.";
    await loadDashboard();
    resetContentForm();
  } catch (error) {
    contentStatus.textContent = error.message;
  }
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(settingsForm).entries());
  try {
    await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify(data) });
    settingsStatus.textContent = "Video alanı güncellendi.";
    await loadDashboard();
  } catch (error) {
    settingsStatus.textContent = error.message;
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  try {
    await api("/api/admin/contact", { method: "PATCH", body: JSON.stringify(data) });
    contactStatus.textContent = "İletişim bilgileri güncellendi.";
    await loadDashboard();
  } catch (error) {
    contactStatus.textContent = error.message;
  }
});

collectionSelect.addEventListener("change", () => {
  state.collection = collectionSelect.value;
  resetContentForm();
  renderContentList();
});

contentList.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) fillContentForm(editId);
  if (deleteId) {
    const ok = window.confirm("Bu içeriği silmek istiyor musunuz?");
    if (!ok) return;
    await api(`/api/admin/${state.collection}/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
    await loadDashboard();
  }
});

leadsBody.addEventListener("change", async (event) => {
  const id = event.target.dataset.leadStatus;
  if (!id) return;
  await api(`/api/admin/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: event.target.value })
  });
  await loadDashboard();
});

document.querySelector("#refresh-button").addEventListener("click", loadDashboard);
document.querySelector("#reset-content-form").addEventListener("click", resetContentForm);
document.querySelector("#logout-button").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST", body: "{}" });
  window.location.href = "/admin/login";
});

loadDashboard();
