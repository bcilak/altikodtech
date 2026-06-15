function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function videoEmbedUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^(\/|\.\/|\.\.\/)/.test(value)) return value;
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) return value;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
  } catch {
    return "";
  }
  return value;
}

function renderVideo(settings) {
  const screen = document.querySelector("#hero-video-screen");
  const title = document.querySelector("#hero-video-title");
  const subtitle = document.querySelector("#hero-video-subtitle");
  const cta = document.querySelector("#hero-video-cta");
  const play = document.querySelector("#hero-video-play");
  const poster = screen?.querySelector(".hero-video-poster");
  if (!screen || !settings) return;

  title.textContent = settings.videoTitle || "Altıkod Demo";
  subtitle.textContent = settings.videoSubtitle || "AI, WhatsApp, web + mobil ve entegrasyon çözümleri";
  cta.textContent = settings.videoCtaLabel || "Demo talep et";

  const embed = videoEmbedUrl(settings.videoUrl);
  screen.querySelector("iframe, video")?.remove();
  title.classList.remove("hidden");
  subtitle.classList.remove("hidden");
  play.classList.remove("hidden");

  if (!embed) {
    screen.classList.remove("has-video");
    poster?.classList.add("hidden");
    return;
  }

  screen.classList.add("has-video");
  poster?.classList.remove("hidden");
  const isVideoFile = /\.(mp4|webm|ogg)(\?.*)?$/i.test(embed);
  const media = document.createElement(isVideoFile ? "video" : "iframe");
  media.className = "hero-video-embed";
  media.setAttribute("title", settings.videoTitle || "Altıkod Demo");
  if (isVideoFile) {
    media.controls = true;
    media.autoplay = true;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.preload = "auto";
    media.poster = "/assets/altikod-demo-poster.png";
    media.src = embed;
  } else {
    media.src = embed;
    media.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    media.allowFullscreen = true;
  }
  title.classList.add("hidden");
  subtitle.classList.add("hidden");
  play.classList.add("hidden");
  screen.appendChild(media);
}

function renderServices(services) {
  const grid = document.querySelector("#services-grid");
  if (!grid || !services?.length) return;
  grid.innerHTML = services.map((item) => `
    <article class="service-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <ul>${(item.items || []).map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join("")}</ul>
    </article>
  `).join("");
}

function renderProducts(products) {
  const grid = document.querySelector("#products-grid");
  if (!grid || !products?.length) return;
  const variants = ["", "red", "yellow", "violet", "", "red"];
  grid.innerHTML = products.map((item, index) => `
    <article class="product-card ${variants[index % variants.length]}">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <strong>Kullanım alanları</strong>
      <p>${escapeHtml(item.usage)}</p>
      <strong>Faydalar</strong>
      <p>${escapeHtml(item.benefits)}</p>
    </article>
  `).join("");
}

function renderCases(cases) {
  const grid = document.querySelector("#cases-grid");
  if (!grid || !cases?.length) return;
  const variants = ["", "yellow", "red"];
  grid.innerHTML = cases.map((item, index) => `
    <article class="case-card ${variants[index % variants.length]}">
      <h3>${escapeHtml(item.title)}</h3>
      <p><strong>Problem:</strong> ${escapeHtml(item.problem)}</p>
      <p><strong>Çözüm:</strong> ${escapeHtml(item.solution)}</p>
      <p><strong>Sonuç:</strong> ${escapeHtml(item.result)}</p>
    </article>
  `).join("");
}

function renderFaqs(faqs) {
  const list = document.querySelector("#faq-list");
  if (!list || !faqs?.length) return;
  list.innerHTML = faqs.map((item, index) => `
    <details ${index === 0 ? "open" : ""}>
      <summary>${escapeHtml(item.question)}</summary>
      <p>${escapeHtml(item.answer)}</p>
    </details>
  `).join("");
}

function renderContact(contact) {
  const list = document.querySelector(".contact-list");
  if (!list || !contact) return;
  const rows = [
    ["Telefon", contact.phone],
    ["E-posta", contact.email],
    ["WhatsApp", contact.whatsapp],
    ["Adres", contact.address],
    ["LinkedIn", contact.linkedin],
    ["Instagram", contact.instagram],
    ["Web", contact.website]
  ].filter(([, value]) => value);

  if (!rows.length) return;
  list.innerHTML = rows.map(([label, value]) => {
    const safeValue = escapeHtml(value);
    const href =
      label === "E-posta" ? `mailto:${safeValue}` :
      label === "Web" && !/^https?:\/\//i.test(value) ? `https://${safeValue}` :
      label === "LinkedIn" && !/^https?:\/\//i.test(value) ? `https://${safeValue}` :
      label === "Instagram" && !/^https?:\/\//i.test(value) ? `https://${safeValue}` :
      "";
    const content = href ? `<a href="${href}">${safeValue}</a>` : safeValue;
    return `<li><strong>${label}:</strong> ${content}</li>`;
  }).join("");
}

async function loadPublicContent() {
  try {
    const response = await fetch("/api/public");
    if (!response.ok) return;
    const data = await response.json();
    renderVideo(data.settings);
    renderServices(data.services);
    renderProducts(data.products);
    renderCases(data.cases);
    renderFaqs(data.faqs);
    renderContact(data.contact);
  } catch {
    // Static fallback content remains visible if the local API is not running.
  }
}

function bindDemoForm() {
  const form = document.querySelector("#demo-form");
  const status = document.querySelector("#demo-form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Talebiniz kaydediliyor...";
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Talep kaydedilemedi.");
      form.reset();
      status.textContent = "Talebiniz alındı. Ekibimiz kısa süre içinde sizinle iletişime geçecek.";
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

loadPublicContent();
bindDemoForm();
