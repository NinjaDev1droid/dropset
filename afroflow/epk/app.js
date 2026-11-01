// ============================================
//  DropSet – EPK (Electronic Press Kit)
//  Every DJ fills in their own details with the
//  "Edit Press Kit" form. Everything is saved in
//  this browser (and included in DropSet backups).
// ============================================

const EPK_KEY = "dropset_epk";

const DEFAULT_STAT_LABELS = ["Events Played", "Years Experience", "Social Followers", "Countries Performed"];

const GENRE_CHOICES = [
  "Afrobeats", "Amapiano", "Afro House", "Afro-Pop", "Hip-Hop", "Trap", "Drill", "R&B",
  "Neo-Soul", "Dancehall", "Reggae", "Reggaeton", "Latin", "House", "Techno", "Pop", "Open Format",
];

const EVENT_CHOICES = [
  "🎉 Club Nights", "💒 Weddings", "🎪 Festivals", "🏢 Corporate Events", "🎂 Private Parties",
  "🏙️ Rooftop Events", "📺 Live Streams", "🎓 University Events",
];

function emptyEpk() {
  return {
    name: "", tagline: "", location: "", photo: "", bio: "",
    stats: DEFAULT_STAT_LABELS.map(label => ({ number: "", label })),
    genres: [], events: [],
    mixes: [], youtubeChannel: "", videos: [],
    venues: [], testimonials: [],
    contact: { email: "", phone: "", whatsapp: "", instagram: "", tiktok: "", soundcloud: "", mixcloud: "", website: "" },
  };
}

function loadEpk() {
  try {
    const saved = JSON.parse(localStorage.getItem(EPK_KEY));
    if (!saved) return emptyEpk();
    const base = emptyEpk();
    return { ...base, ...saved, contact: { ...base.contact, ...(saved.contact || {}) } };
  } catch { return emptyEpk(); }
}

let epk = loadEpk();

function saveEpk() {
  try {
    localStorage.setItem(EPK_KEY, JSON.stringify(epk));
    flashSaved("✓ Saved");
  } catch {
    flashSaved("⚠️ Couldn't save — try a smaller photo", true);
  }
}

function isEmptyEpk(e) {
  return !e.name.trim() && !e.bio.trim() && !e.mixes.length && !e.videos.length &&
         !Object.values(e.contact).some(v => v.trim());
}

// ── Helpers ──────────────────────────────────

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Accepts "soundcloud.com/me" or a full link; only http(s) links are allowed
function toUrl(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return "";
  return "https://" + t;
}

// "@me", "me" or "instagram.com/me" → { url, label }
function socialLink(value, base) {
  const v = String(value || "").trim();
  if (!v) return null;
  if (v.includes("/")) {
    const url = toUrl(v);
    if (!url) return null;
    const handle = url.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop().replace(/^@/, "");
    return { url, label: "@" + handle };
  }
  const handle = v.replace(/^@/, "");
  return { url: base + encodeURIComponent(handle), label: "@" + handle };
}

function digitsOnly(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function youtubeId(url) {
  const u = toUrl(url);
  if (!u) return "";
  try {
    const p = new URL(u);
    const host = p.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return p.pathname.slice(1).split("/")[0];
    if (host === "youtube.com" || host === "music.youtube.com") {
      if (p.searchParams.get("v")) return p.searchParams.get("v");
      const m = p.pathname.match(/^\/(?:live|shorts|embed)\/([\w-]+)/);
      if (m) return m[1];
    }
  } catch {}
  return "";
}

// The player to show under a mix, if the site supports one
function mixPlayer(url) {
  const host = hostOf(url);
  if (host === "mixcloud.com") {
    const path = new URL(url).pathname;
    return `<iframe width="100%" height="60" loading="lazy" title="Mixcloud player"
      src="https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${encodeURIComponent(path)}"
      frameborder="0" allow="encrypted-media; fullscreen; autoplay"></iframe>`;
  }
  if (host === "soundcloud.com") {
    return `<iframe width="100%" height="120" loading="lazy" title="SoundCloud player" scrolling="no" frameborder="0" allow="autoplay"
      src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f5a623&visual=false"></iframe>`;
  }
  const id = youtubeId(url);
  if (id) {
    return `<iframe width="100%" height="220" loading="lazy" title="YouTube player" frameborder="0" allowfullscreen
      src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}"></iframe>`;
  }
  return "";
}

function platformName(url) {
  const host = hostOf(url);
  if (host === "mixcloud.com") return "Mixcloud";
  if (host === "soundcloud.com") return "SoundCloud";
  if (youtubeId(url) || host.endsWith("youtube.com")) return "YouTube";
  if (host.includes("spotify")) return "Spotify";
  if (host.includes("apple")) return "Apple Music";
  return host || "link";
}

// ── Render the press kit ─────────────────────

function section(id, title, body, extraClass = "") {
  return `<section class="card ${extraClass}" id="${id}"><h2 class="section-title">${title}</h2>${body}</section>`;
}

function contactItems(c, name) {
  const items = [];
  if (c.email.trim()) items.push(["📧", `mailto:${c.email.trim()}`, c.email.trim()]);
  if (c.phone.trim()) items.push(["📱", `tel:${c.phone.trim().startsWith("+") ? "+" : ""}${digitsOnly(c.phone)}`, c.phone.trim()]);
  if (c.whatsapp.trim()) {
    const msg = encodeURIComponent(`Hi ${name || ""}, I'd like to book you for an event.`.replace(/\s+,/, ","));
    items.push(["💬", `https://wa.me/${digitsOnly(c.whatsapp)}?text=${msg}`, `WhatsApp: ${c.whatsapp.trim()}`]);
  }
  const ig = socialLink(c.instagram, "https://www.instagram.com/");
  if (ig) items.push(["📸", ig.url, ig.label]);
  const tt = socialLink(c.tiktok, "https://www.tiktok.com/@");
  if (tt) items.push(["🎵", tt.url, tt.label]);
  for (const [icon, value] of [["☁️", c.soundcloud], ["🎧", c.mixcloud], ["🌐", c.website]]) {
    const url = toUrl(value);
    if (url) items.push([icon, url, url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")]);
  }
  return items;
}

function renderKit() {
  const kit = document.getElementById("kit");
  const welcome = document.getElementById("welcome");
  const empty = isEmptyEpk(epk);
  welcome.style.display = empty ? "block" : "none";
  kit.style.display = empty ? "none" : "block";
  document.title = epk.name.trim() ? `${epk.name.trim()} – Press Kit` : "DJ Press Kit – DropSet EPK";
  if (empty) return;

  const e = epk;
  const name = e.name.trim();
  const contacts = contactItems(e.contact, name);
  const mixes = e.mixes.filter(m => toUrl(m.url) || m.title.trim());
  const videos = e.videos.map(youtubeId).filter(Boolean);
  const channel = toUrl(e.youtubeChannel);

  // Hero
  const avatar = e.photo
    ? `<img class="hero-photo" src="${esc(e.photo)}" alt="${esc(name || "DJ photo")}" />`
    : `<div class="hero-avatar">🎧</div>`;
  let html = `
    <section class="hero">
      ${avatar}
      <h1 class="dj-name">${esc(name || "Your DJ Name")}</h1>
      ${e.tagline.trim() ? `<p class="dj-tagline">${esc(e.tagline)}</p>` : ""}
      ${e.location.trim() ? `<p class="dj-location">📍 ${esc(e.location)}</p>` : ""}
      ${e.genres.length ? `<div class="hero-tags">${e.genres.map(g => `<span class="hero-tag">${esc(g)}</span>`).join("")}</div>` : ""}
      <div class="hero-actions">
        ${contacts.length ? `<a href="#contact" class="btn-primary">Book Me</a>` : ""}
        ${mixes.length ? `<a href="#mixes" class="btn-secondary">Hear My Mixes</a>` : ""}
      </div>
    </section>
    <main>`;

  if (e.bio.trim()) {
    html += section("about", "About", `<p class="bio">${esc(e.bio).replace(/\n/g, "<br>")}</p>`);
  }

  const stats = e.stats.filter(s => s.number.trim());
  if (stats.length) {
    html += `<section class="stats-grid">${stats.map(s => `
      <div class="stat-card">
        <div class="stat-number">${esc(s.number)}</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join("")}</section>`;
  }

  if (e.events.length) {
    html += section("events", "Available For",
      `<div class="event-tags">${e.events.map(ev => `<span class="event-tag">${esc(ev)}</span>`).join("")}</div>`);
  }

  if (mixes.length) {
    html += section("mixes", "Listen to My Mixes", `<div class="mix-list">${mixes.map(m => {
      const url = toUrl(m.url);
      return `
        <div class="mix-item">
          <div class="mix-info"><div class="mix-title">${esc(m.title.trim() || "Mix")}</div></div>
          ${url ? `<a class="mix-link" href="${esc(url)}" target="_blank" rel="noopener">▶ Listen on ${esc(platformName(url))}</a>` : ""}
        </div>
        ${url && mixPlayer(url) ? `<div class="mix-embed-wrap">${mixPlayer(url)}</div>` : ""}`;
    }).join("")}</div>`);
  }

  if (videos.length || channel) {
    html += section("youtube", "Watch on YouTube", `
      ${channel ? `
        <div class="yt-header">
          <div class="mixcloud-brand">
            <span class="mixcloud-logo">▶️</span>
            <div>
              <div class="mixcloud-name">${esc(name || "Me")} on YouTube</div>
              <div class="mixcloud-handle">${esc(channel.replace(/^https?:\/\/(www\.)?/, ""))}</div>
            </div>
          </div>
          <a href="${esc(channel)}" target="_blank" rel="noopener" class="btn-yt">Open Channel ↗</a>
        </div>` : ""}
      ${videos.length ? `<div class="yt-grid">${videos.map((id, i) => `
        <a class="yt-thumb" href="https://www.youtube.com/watch?v=${encodeURIComponent(id)}" target="_blank" rel="noopener">
          <img src="https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg" alt="Video ${i + 1}" />
          <div class="yt-play-btn"><div class="yt-play-icon"></div></div>
        </a>`).join("")}</div>` : ""}`);
  }

  const venues = e.venues.filter(v => v.name.trim());
  if (venues.length) {
    html += section("venues", "Past Venues & Events", `<div class="venue-list">${venues.map(v => `
      <div class="venue-item">
        <div class="venue-name">${esc(v.name)}</div>
        <div class="venue-date">${esc(v.year)}</div>
      </div>`).join("")}</div>`);
  }

  const quotes = e.testimonials.filter(t => t.quote.trim());
  if (quotes.length) {
    html += section("testimonials", "What People Say", `<div class="testimonial-grid">${quotes.map(t => `
      <div class="testimonial">
        <p class="testimonial-text">“${esc(t.quote.trim().replace(/^["“]|["”]$/g, ""))}”</p>
        ${t.author.trim() ? `<div class="testimonial-author">— ${esc(t.author.trim().replace(/^[-—–]\s*/, ""))}</div>` : ""}
      </div>`).join("")}</div>`);
  }

  if (contacts.length) {
    const email = e.contact.email.trim();
    const cta = email
      ? `<div class="book-cta"><a class="btn-book-cta" target="_blank" href="mailto:${esc(email)}?subject=${encodeURIComponent("DJ Booking Inquiry")}&body=${encodeURIComponent(`Hi ${name || ""}, I'd like to book you for an event. Please let me know your availability.`.replace(/\s+,/, ","))}">📩 Send Booking Request</a></div>`
      : "";
    html += section("contact", "Book Me", `
      <p class="contact-intro">Available for bookings. Let's make your event unforgettable.</p>
      <div class="contact-grid">${contacts.map(([icon, url, label]) => `
        <div class="contact-item">
          <span class="contact-icon">${icon}</span>
          <a href="${esc(url)}" class="contact-value" target="_blank" rel="noopener">${esc(label)}</a>
        </div>`).join("")}</div>
      ${cta}`, "contact-card");
  }

  html += `</main>
    <footer><p>Electronic Press Kit${name ? ` · ${esc(name)}` : ""}</p><p class="footer-hint">Made with DropSet</p></footer>`;
  kit.innerHTML = html;
}

// ── Editor ───────────────────────────────────

function openEditor() {
  fillForm();
  document.body.classList.add("editing");
  document.getElementById("editor").scrollTop = 0;
  document.getElementById("fName").focus();
}

function closeEditor() {
  document.body.classList.remove("editing");
  window.scrollTo({ top: 0 });
}

function fillForm() {
  const e = epk;
  for (const [id, key] of [["fName", "name"], ["fTagline", "tagline"], ["fLocation", "location"], ["fBio", "bio"], ["fYoutube", "youtubeChannel"]]) {
    document.getElementById(id).value = e[key];
  }
  for (const key of Object.keys(e.contact)) {
    document.getElementById("c_" + key).value = e.contact[key];
  }
  document.getElementById("statFields").innerHTML = e.stats.map((s, i) => `
    <div class="row-2">
      <input data-stat="${i}" data-field="number" value="${esc(s.number)}" placeholder="e.g. 200+" aria-label="Number" />
      <input data-stat="${i}" data-field="label" value="${esc(s.label)}" placeholder="Label" aria-label="Label" />
    </div>`).join("");
  renderChoices("genreChoices", GENRE_CHOICES, e.genres, "genres");
  renderChoices("eventChoices", EVENT_CHOICES, e.events, "events");
  renderPhoto();
  renderLists();
}

function renderChoices(containerId, choices, selected, key) {
  const extras = selected.filter(s => !choices.includes(s));
  document.getElementById(containerId).innerHTML = [...choices, ...extras].map(c => `
    <button type="button" class="choice ${selected.includes(c) ? "on" : ""}" data-key="${key}" data-value="${esc(c)}">${esc(c)}</button>`).join("");
}

function toggleChoice(btn) {
  const list = epk[btn.dataset.key];
  const v = btn.dataset.value;
  epk[btn.dataset.key] = list.includes(v) ? list.filter(x => x !== v) : [...list, v];
  btn.classList.toggle("on");
  changed();
}

function addCustomChoice(inputId, key, containerId, choices) {
  const input = document.getElementById(inputId);
  const v = input.value.trim();
  if (!v) return;
  if (!epk[key].includes(v)) epk[key].push(v);
  input.value = "";
  renderChoices(containerId, choices, epk[key], key);
  changed();
}

// Repeatable lists: mixes, videos, venues, testimonials
const LISTS = {
  mixes:        { container: "mixFields",   blank: () => ({ title: "", url: "" }),
                  fields: [["title", "Mix name, e.g. Afrobeats Summer Mix"], ["url", "Link (Mixcloud, SoundCloud, YouTube…)"]] },
  videos:       { container: "videoFields", blank: () => "",
                  fields: [[null, "YouTube video link"]] },
  venues:       { container: "venueFields", blank: () => ({ name: "", year: "" }),
                  fields: [["name", "Venue or event, e.g. Club XO – London"], ["year", "Year"]] },
  testimonials: { container: "quoteFields", blank: () => ({ quote: "", author: "" }),
                  fields: [["quote", "What they said"], ["author", "Who said it, e.g. Club promoter, London"]] },
};

function renderLists() {
  for (const [key, cfg] of Object.entries(LISTS)) {
    document.getElementById(cfg.container).innerHTML = epk[key].map((item, i) => `
      <div class="list-row">
        <div class="list-inputs ${cfg.fields.length > 1 ? "two" : ""} ${key === "venues" ? "venue-row" : ""}">
          ${cfg.fields.map(([field, ph]) => `
            <input data-list="${key}" data-index="${i}" data-field="${field ?? ""}" placeholder="${esc(ph)}"
                   value="${esc(field ? item[field] : item)}" />`).join("")}
        </div>
        <button type="button" class="remove-btn" data-remove="${key}" data-index="${i}" title="Remove" aria-label="Remove">✕</button>
      </div>`).join("");
  }
}

function addListItem(key) {
  epk[key].push(LISTS[key].blank());
  renderLists();
  const inputs = document.querySelectorAll(`#${LISTS[key].container} input`);
  inputs[inputs.length - LISTS[key].fields.length]?.focus();
  changed();
}

// Photo: shrink to max 600px so it fits in browser storage
function onPhotoChosen(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 600 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    epk.photo = canvas.toDataURL("image/jpeg", 0.85);
    URL.revokeObjectURL(img.src);
    renderPhoto();
    changed();
  };
  img.onerror = () => flashSaved("⚠️ That file isn't a photo", true);
  img.src = URL.createObjectURL(file);
  ev.target.value = "";
}

function removePhoto() {
  epk.photo = "";
  renderPhoto();
  changed();
}

function renderPhoto() {
  document.getElementById("photoPreview").innerHTML = epk.photo
    ? `<img src="${esc(epk.photo)}" alt="Your photo" />` : "🎧";
  document.getElementById("removePhotoBtn").style.display = epk.photo ? "inline-block" : "none";
}

function onFormInput(ev) {
  const t = ev.target;
  if (t.dataset.list) {
    const list = epk[t.dataset.list];
    const i = Number(t.dataset.index);
    if (t.dataset.field) list[i][t.dataset.field] = t.value;
    else list[i] = t.value;
  } else if (t.dataset.stat) {
    epk.stats[Number(t.dataset.stat)][t.dataset.field] = t.value;
  } else if (t.id.startsWith("c_")) {
    epk.contact[t.id.slice(2)] = t.value;
  } else {
    const key = { fName: "name", fTagline: "tagline", fLocation: "location", fBio: "bio", fYoutube: "youtubeChannel" }[t.id];
    if (!key) return;
    epk[key] = t.value;
  }
  changed();
}

function onFormClick(ev) {
  const t = ev.target.closest("button");
  if (!t) return;
  if (t.classList.contains("choice")) toggleChoice(t);
  else if (t.dataset.remove) {
    epk[t.dataset.remove].splice(Number(t.dataset.index), 1);
    renderLists();
    changed();
  } else if (t.dataset.add) addListItem(t.dataset.add);
}

function changed() {
  saveEpk();
  renderKit();
}

let savedTimer = null;
function flashSaved(text, isError = false) {
  const el = document.getElementById("saveStatus");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("error", isError);
  clearTimeout(savedTimer);
  if (!isError) savedTimer = setTimeout(() => { el.textContent = "All changes saved"; }, 1500);
}

// ── Init ─────────────────────────────────────

function initEpk() {
  const form = document.getElementById("editorForm");
  form.addEventListener("input", onFormInput);
  form.addEventListener("click", onFormClick);
  form.addEventListener("submit", ev => ev.preventDefault());
  document.getElementById("photoInput").addEventListener("change", onPhotoChosen);
  document.getElementById("genreCustom").addEventListener("keydown", ev => {
    if (ev.key === "Enter") { ev.preventDefault(); addCustomChoice("genreCustom", "genres", "genreChoices", GENRE_CHOICES); }
  });
  document.getElementById("eventCustom").addEventListener("keydown", ev => {
    if (ev.key === "Enter") { ev.preventDefault(); addCustomChoice("eventCustom", "events", "eventChoices", EVENT_CHOICES); }
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && document.body.classList.contains("editing")) closeEditor();
  });
  // Restored from a backup in another tab → show it
  window.addEventListener("storage", ev => {
    if (ev.key === EPK_KEY) { epk = loadEpk(); renderKit(); }
  });
  renderKit();
}

initEpk();
