const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");

const rootDir = __dirname;
const dataPath = path.join(rootDir, "data", "db.json");
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD || "Altikod2026!";
const sessions = new Map();
const rateLimit = new Map();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg"
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  });
  res.end(payload);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(text);
}

async function readDb() {
  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(db, null, 2), "utf8");
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      })
  );
}

function isAuthed(req) {
  const sid = parseCookies(req).ak_admin;
  const session = sid && sessions.get(sid);
  if (!session) return false;
  if (Date.now() - session.createdAt > 1000 * 60 * 60 * 8) {
    sessions.delete(sid);
    return false;
  }
  return true;
}

function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  sendJson(res, 401, { error: "Yetkisiz erişim" });
  return false;
}

function getClientKey(req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local";
}

function checkRate(req, key, max, windowMs) {
  const id = `${key}:${getClientKey(req)}`;
  const now = Date.now();
  const recent = (rateLimit.get(id) || []).filter((item) => now - item < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  rateLimit.set(id, recent);
  return true;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 128) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function cleanString(value, max = 600) {
  return String(value || "").trim().slice(0, max);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeItem(collection, input) {
  const base = {
    id: cleanString(input.id, 80) || `${collection}-${crypto.randomUUID()}`,
    title: cleanString(input.title, 140),
    summary: cleanString(input.summary, 800),
    active: Boolean(input.active)
  };

  if (!base.title) throw new Error("Başlık zorunlu");

  if (collection === "services") {
    return {
      ...base,
      items: Array.isArray(input.items)
        ? input.items.map((item) => cleanString(item, 220)).filter(Boolean).slice(0, 6)
        : cleanString(input.items, 1000).split("\n").map((item) => cleanString(item, 220)).filter(Boolean).slice(0, 6)
    };
  }

  if (collection === "products") {
    return {
      ...base,
      usage: cleanString(input.usage, 600),
      benefits: cleanString(input.benefits, 600)
    };
  }

  if (collection === "cases") {
    return {
      id: base.id,
      title: base.title,
      problem: cleanString(input.problem, 600),
      solution: cleanString(input.solution, 600),
      result: cleanString(input.result, 600),
      active: base.active
    };
  }

  if (collection === "faqs") {
    return {
      id: base.id,
      question: cleanString(input.question || input.title, 220),
      answer: cleanString(input.answer || input.summary, 1200),
      active: base.active
    };
  }

  throw new Error("Geçersiz koleksiyon");
}

function publicDb(db) {
  const active = (items) => items.filter((item) => item.active !== false);
  return {
    settings: db.settings,
    contact: db.contact || {},
    services: active(db.services || []),
    products: active(db.products || []),
    cases: active(db.cases || []),
    faqs: active(db.faqs || [])
  };
}

async function serveFile(req, res, pathname) {
  const routes = {
    "/": "index.html",
    "/admin": "admin.html",
    "/admin/": "admin.html",
    "/admin/login": "admin-login.html"
  };
  const relative = routes[pathname] || pathname.slice(1);
  const resolved = path.resolve(rootDir, relative);
  if (!resolved.startsWith(rootDir)) return sendText(res, 403, "Forbidden");

  try {
    const type = contentTypes[path.extname(resolved).toLowerCase()] || "application/octet-stream";
    const stat = await fs.stat(resolved);

    if (type.startsWith("video/") && req.headers.range) {
      const match = req.headers.range.match(/bytes=(\d*)-(\d*)/);
      if (!match) return sendText(res, 416, "Invalid range");
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      if (start >= stat.size || end >= stat.size || start > end) {
        res.writeHead(416, {
          "Content-Range": `bytes */${stat.size}`,
          "Accept-Ranges": "bytes"
        });
        return res.end();
      }
      const stream = require("node:fs").createReadStream(resolved, { start, end });
      res.writeHead(206, {
        "Content-Type": type,
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff"
      });
      return stream.pipe(res);
    }

    const content = await fs.readFile(resolved);
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stat.size,
      "Accept-Ranges": type.startsWith("video/") ? "bytes" : "none",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN"
    });
    res.end(content);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "GET" && url.pathname === "/api/public") {
      const db = await readDb();
      return sendJson(res, 200, publicDb(db));
    }

    if (req.method === "POST" && url.pathname === "/api/leads") {
      if (!checkRate(req, "lead", 8, 1000 * 60 * 10)) return sendJson(res, 429, { error: "Çok fazla talep gönderildi" });
      const input = await readBody(req);
      const lead = {
        id: `lead-${crypto.randomUUID()}`,
        name: cleanString(input.name, 120),
        email: cleanString(input.email, 160).toLowerCase(),
        interest: cleanString(input.interest, 180),
        message: cleanString(input.message, 1200),
        status: "new",
        createdAt: new Date().toISOString()
      };
      if (!lead.name) return sendJson(res, 400, { error: "Ad soyad zorunlu" });
      if (!validateEmail(lead.email)) return sendJson(res, 400, { error: "Geçerli bir e-posta yazın" });
      const db = await readDb();
      db.leads = [lead, ...(db.leads || [])];
      await writeDb(db);
      return sendJson(res, 201, { success: true, lead });
    }

    if (req.method === "POST" && url.pathname === "/api/admin/login") {
      if (!checkRate(req, "login", 10, 1000 * 60 * 10)) return sendJson(res, 429, { error: "Çok fazla giriş denemesi" });
      const input = await readBody(req);
      if (cleanString(input.password, 200) !== adminPassword) return sendJson(res, 401, { error: "Şifre hatalı" });
      const sid = crypto.randomBytes(32).toString("hex");
      sessions.set(sid, { createdAt: Date.now() });
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `ak_admin=${encodeURIComponent(sid)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`,
        "X-Content-Type-Options": "nosniff"
      });
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === "POST" && url.pathname === "/api/admin/logout") {
      const sid = parseCookies(req).ak_admin;
      if (sid) sessions.delete(sid);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": "ak_admin=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
      });
      return res.end(JSON.stringify({ success: true }));
    }

    if (url.pathname.startsWith("/api/admin/") && !requireAuth(req, res)) return;

    if (req.method === "GET" && url.pathname === "/api/admin/dashboard") {
      const db = await readDb();
      return sendJson(res, 200, db);
    }

    if (req.method === "PATCH" && url.pathname === "/api/admin/settings") {
      const input = await readBody(req);
      const db = await readDb();
      db.settings = {
        videoTitle: cleanString(input.videoTitle, 120),
        videoSubtitle: cleanString(input.videoSubtitle, 240),
        videoUrl: cleanString(input.videoUrl, 500),
        videoCtaLabel: cleanString(input.videoCtaLabel, 80) || "Demo talep et"
      };
      await writeDb(db);
      return sendJson(res, 200, db.settings);
    }

    if (req.method === "PATCH" && url.pathname === "/api/admin/contact") {
      const input = await readBody(req);
      const db = await readDb();
      db.contact = {
        phone: cleanString(input.phone, 120),
        email: cleanString(input.email, 160),
        whatsapp: cleanString(input.whatsapp, 120),
        address: cleanString(input.address, 300),
        linkedin: cleanString(input.linkedin, 240),
        instagram: cleanString(input.instagram, 240),
        website: cleanString(input.website, 240)
      };
      await writeDb(db);
      return sendJson(res, 200, db.contact);
    }

    const collectionMatch = url.pathname.match(/^\/api\/admin\/(services|products|cases|faqs)(?:\/([^/]+))?$/);
    if (collectionMatch) {
      const collection = collectionMatch[1];
      const id = collectionMatch[2];
      const db = await readDb();
      db[collection] = db[collection] || [];

      if (req.method === "POST" && !id) {
        const item = normalizeItem(collection, await readBody(req));
        db[collection].unshift(item);
        await writeDb(db);
        return sendJson(res, 201, item);
      }

      if (req.method === "PUT" && id) {
        const index = db[collection].findIndex((item) => item.id === id);
        if (index < 0) return sendJson(res, 404, { error: "İçerik bulunamadı" });
        const item = normalizeItem(collection, { ...(await readBody(req)), id });
        db[collection][index] = item;
        await writeDb(db);
        return sendJson(res, 200, item);
      }

      if (req.method === "DELETE" && id) {
        db[collection] = db[collection].filter((item) => item.id !== id);
        await writeDb(db);
        return sendJson(res, 200, { success: true });
      }
    }

    const leadMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)$/);
    if (leadMatch && req.method === "PATCH") {
      const db = await readDb();
      const input = await readBody(req);
      const lead = (db.leads || []).find((item) => item.id === leadMatch[1]);
      if (!lead) return sendJson(res, 404, { error: "Talep bulunamadı" });
      lead.status = cleanString(input.status, 40) || lead.status;
      await writeDb(db);
      return sendJson(res, 200, lead);
    }

    sendJson(res, 404, { error: "Endpoint bulunamadı" });
  } catch (error) {
    console.error(error);
    sendJson(res, error.message === "Payload too large" ? 413 : 400, { error: "İşlem tamamlanamadı" });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) return handleApi(req, res, url);
  return serveFile(req, res, url.pathname);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Altıkod panel running at http://127.0.0.1:${port}`);
  console.log(`Admin password: ${adminPassword}`);
});
