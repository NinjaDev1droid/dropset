// ============================================
//  DropSet – Gig Tracker Logic
//  All data saved in localStorage.
// ============================================

const STORAGE_KEY = "dropset_gigs";

// ── Helpers ──────────────────────────────────

function loadGigs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveGigs(gigs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gigs));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function fmtMoney(n) {
  if (!n) return "$0";
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function statusBadge(s) {
  const map = {
    confirmed: ["badge-confirmed", "✅ Confirmed"],
    pending:   ["badge-pending",   "⏳ Pending"],
    completed: ["badge-completed", "🎤 Completed"],
    cancelled: ["badge-cancelled", "❌ Cancelled"],
  };
  const [cls, label] = map[s] || ["badge-pending", s];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function payClass(payStatus) {
  return { paid:"earned", deposit:"pending-pay", unpaid:"unpaid" }[payStatus] || "unpaid";
}

function payLabel(g) {
  if (g.payStatus === "deposit") {
    return g.deposit ? `Deposit ${fmtMoney(g.deposit)} received` : "Deposit received";
  }
  return { paid:"Paid ✅", unpaid:"Unpaid" }[g.payStatus] || "";
}

// Money actually in hand for a gig
function amountReceived(g) {
  const pay = Number(g.pay) || 0;
  if (g.payStatus === "paid")    return pay;
  if (g.payStatus === "deposit") return Math.min(Number(g.deposit) || 0, pay);
  return 0;
}

function isUpcoming(g) {
  return g.status !== "completed" && (g.date || "") >= localToday();
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "Club Lagos!" → "ClubLagos", "New York, NY" → "NewYork"
function hashtag(text) {
  return String(text || "").split(",")[0].replace(/[^\p{L}\p{N}_]/gu, "");
}

// ── Dashboard Stats ───────────────────────────

function updateDashboard() {
  const gigs = loadGigs();
  const today = localToday();

  const completed = gigs.filter(g => g.status === "completed");
  const upcoming  = gigs.filter(g => g.status !== "cancelled" && g.date >= today);
  const totalEarned = completed.reduce((s, g) => s + amountReceived(g), 0);
  const pending = gigs
    .filter(g => g.status !== "cancelled")
    .reduce((s, g) => s + ((Number(g.pay) || 0) - amountReceived(g)), 0);
  const avg = completed.length
    ? Math.round(totalEarned / completed.length)
    : 0;

  document.getElementById("statTotal").textContent     = gigs.length;
  document.getElementById("statCompleted").textContent = completed.length;
  document.getElementById("statUpcoming").textContent  = upcoming.length;
  document.getElementById("statIncome").textContent    = fmtMoney(totalEarned);
  document.getElementById("statAvg").textContent       = fmtMoney(avg);
  document.getElementById("statPending").textContent   = fmtMoney(pending);
}

// ── Populate year filter ──────────────────────

function populateYearFilter() {
  const gigs = loadGigs();
  const years = [...new Set(gigs.map(g => g.date?.slice(0,4)).filter(Boolean))].sort().reverse();
  const sel = document.getElementById("filterYear");
  // keep first option
  const existing = [...sel.options].map(o => o.value);
  years.forEach(y => {
    if (!existing.includes(y)) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    }
  });
}

// ── Render Gigs ───────────────────────────────

function renderGigs() {
  updateDashboard();
  populateYearFilter();

  const gigs      = loadGigs();
  const search    = document.getElementById("searchInput").value.toLowerCase();
  const status    = document.getElementById("filterStatus").value;
  const type      = document.getElementById("filterType").value;
  const year      = document.getElementById("filterYear").value;
  const sortBy    = document.getElementById("sortBy").value;

  let filtered = gigs.filter(g => {
    const matchSearch = !search ||
      (g.venue || "").toLowerCase().includes(search) ||
      (g.city  || "").toLowerCase().includes(search) ||
      (g.client|| "").toLowerCase().includes(search) ||
      (g.notes || "").toLowerCase().includes(search);
    const matchStatus = !status || g.status === status;
    const matchType   = !type   || g.type   === type;
    const matchYear   = !year   || (g.date || "").startsWith(year);
    return matchSearch && matchStatus && matchType && matchYear;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "date_asc":  return (a.date||"").localeCompare(b.date||"");
      case "pay_desc":  return (Number(b.pay)||0) - (Number(a.pay)||0);
      case "venue":     return (a.venue||"").localeCompare(b.venue||"");
      default:          return (b.date||"").localeCompare(a.date||"");
    }
  });

  const container = document.getElementById("gigList");
  const emptyState = document.getElementById("emptyState");

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  container.innerHTML = filtered.map(g => {
    const d     = g.date ? new Date(g.date + "T12:00:00") : null;
    const day   = d ? d.getDate() : "—";
    const month = d ? d.toLocaleString("en",{month:"short"}).toUpperCase() : "";
    const yr    = d ? d.getFullYear() : "";
    const timeStr = g.time ? `· ${g.time}` : "";
    const durationStr = g.duration ? `· ${g.duration}` : "";
    const amount = g.pay ? fmtMoney(g.pay) : "—";
    const pClass = g.pay ? payClass(g.payStatus) : "unpaid";
    const setlistLine = g.setlist
      ? `<div class="gig-setlist">🎵 ${escHtml(g.setlist)}</div>`
      : "";

    return `
      <div class="gig-card status-${g.status}">
        <div class="gig-date-block">
          <div class="gig-date-day">${day}</div>
          <div class="gig-date-month">${month}</div>
          <div class="gig-date-year">${yr}</div>
        </div>
        <div class="gig-info">
          <div class="gig-venue">${escHtml(g.venue)}</div>
          <div class="gig-meta">
            <span class="gig-city">📍 ${escHtml(g.city || "—")}</span>
            <span class="gig-type-tag">${escHtml(g.type || "")}</span>
            ${statusBadge(g.status)}
            <span class="gig-time">${escHtml(timeStr)} ${escHtml(durationStr)}</span>
          </div>
          ${setlistLine}
          ${g.client ? `<div class="gig-setlist">👤 ${escHtml(g.client)}${g.contact ? " · " + escHtml(g.contact) : ""}</div>` : ""}
          ${g.notes  ? `<div class="gig-setlist">📝 ${escHtml(g.notes)}</div>` : ""}
        </div>
        <div class="gig-pay-block">
          <div class="gig-amount ${pClass}">${amount}</div>
          <div class="gig-pay-status">${payLabel(g)}</div>
        </div>
        <div class="gig-actions">
          <button class="btn-icon social" onclick="openCaption('${g.id}')" title="Generate social caption">📱</button>
          <button class="btn-icon" onclick="editGig('${g.id}')" title="Edit">✏️</button>
          <button class="btn-icon del" onclick="deleteGig('${g.id}')" title="Delete">🗑️</button>
        </div>
      </div>`;
  }).join("");
}

function escHtml(str) {
  return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Add / Edit Modal ──────────────────────────

let editingId = null;

function openGigModal(id = null) {
  editingId = id;
  document.getElementById("gigModalTitle").textContent = id ? "Edit Gig" : "Add Gig";
  clearGigForm();

  if (id) {
    const g = loadGigs().find(g => g.id === id);
    if (!g) return;
    document.getElementById("gVenue").value    = g.venue    || "";
    document.getElementById("gCity").value     = g.city     || "";
    document.getElementById("gDate").value     = g.date     || "";
    document.getElementById("gTime").value     = g.time     || "";
    document.getElementById("gDuration").value = g.duration || "";
    document.getElementById("gType").value     = g.type     || "Club Night";
    document.getElementById("gStatus").value   = g.status   || "confirmed";
    document.getElementById("gPay").value      = g.pay      || "";
    document.getElementById("gPayStatus").value= g.payStatus|| "unpaid";
    document.getElementById("gDeposit").value  = g.deposit  || "";
    document.getElementById("gClient").value   = g.client   || "";
    document.getElementById("gContact").value  = g.contact  || "";
    document.getElementById("gNotes").value    = g.notes    || "";
    document.getElementById("gSetlist").value  = g.setlist  || "";
  }

  document.getElementById("gigModalOverlay").style.display = "flex";
  document.getElementById("gVenue").focus();
}

function editGig(id) { openGigModal(id); }

function closeGigModal() {
  document.getElementById("gigModalOverlay").style.display = "none";
  editingId = null;
}

function closeGigModalOnOverlay(e) {
  if (e.target === document.getElementById("gigModalOverlay")) closeGigModal();
}

function clearGigForm() {
  ["gVenue","gCity","gDate","gTime","gPay","gDeposit","gClient","gContact","gNotes","gSetlist"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("gDuration").value  = "";
  document.getElementById("gType").value      = "Club Night";
  document.getElementById("gStatus").value    = "confirmed";
  document.getElementById("gPayStatus").value = "unpaid";
}

function saveGig() {
  const venue = document.getElementById("gVenue").value.trim();
  const city  = document.getElementById("gCity").value.trim();
  const date  = document.getElementById("gDate").value;
  if (!venue || !date) {
    alert("Please enter at least a Venue and Date.");
    return;
  }

  const gig = {
    id:         editingId || uid(),
    venue,
    city,
    date,
    time:       document.getElementById("gTime").value,
    duration:   document.getElementById("gDuration").value,
    type:       document.getElementById("gType").value,
    status:     document.getElementById("gStatus").value,
    pay:        parseFloat(document.getElementById("gPay").value) || null,
    payStatus:  document.getElementById("gPayStatus").value,
    deposit:    parseFloat(document.getElementById("gDeposit").value) || null,
    client:     document.getElementById("gClient").value.trim(),
    contact:    document.getElementById("gContact").value.trim(),
    notes:      document.getElementById("gNotes").value.trim(),
    setlist:    document.getElementById("gSetlist").value.trim(),
    createdAt:  editingId
      ? (loadGigs().find(g=>g.id===editingId)?.createdAt || Date.now())
      : Date.now(),
  };

  let gigs = loadGigs();
  if (editingId) {
    gigs = gigs.map(g => g.id === editingId ? gig : g);
  } else {
    gigs.unshift(gig);
  }

  saveGigs(gigs);
  closeGigModal();
  renderGigs();
}

// ── Delete ────────────────────────────────────

let deletingId = null;

function deleteGig(id) {
  const venue = loadGigs().find(g => g.id === id)?.venue || "This gig";
  deletingId = id;
  document.getElementById("deleteMsg").textContent =
    `"${venue}" will be permanently removed.`;
  document.getElementById("deleteOverlay").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteOverlay").style.display = "none";
  deletingId = null;
}

function confirmDelete() {
  if (!deletingId) return;
  saveGigs(loadGigs().filter(g => g.id !== deletingId));
  closeDeleteModal();
  renderGigs();
}

// ── Social Caption Generator ──────────────────

const CAPTION_STYLES = ["Hype 🔥", "Professional 🎯", "Story 📖", "Minimal ✨"];
let captionGig = null;
let activeCaptionStyle = 0;

function openCaption(id) {
  captionGig = loadGigs().find(g => g.id === id);
  if (!captionGig) return;
  activeCaptionStyle = 0;

  // Build tabs
  const tabs = document.getElementById("captionTabs");
  tabs.innerHTML = CAPTION_STYLES.map((s, i) =>
    `<button class="caption-tab ${i===0?"active":""}" onclick="selectCaptionStyle(${i})">${s}</button>`
  ).join("");

  renderCaption();
  document.getElementById("captionOverlay").style.display = "flex";
}

function selectCaptionStyle(i) {
  activeCaptionStyle = i;
  document.querySelectorAll(".caption-tab").forEach((t,idx) =>
    t.classList.toggle("active", idx === i)
  );
  renderCaption();
}

function regenerateCaption() { renderCaption(); }

function renderCaption() {
  const g = captionGig;
  if (!g) return;
  const d   = g.date ? new Date(g.date+"T12:00:00") : null;
  const dateStr = d ? d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : "";
  const box = document.getElementById("captionBox");
  box.textContent = buildCaption(g, activeCaptionStyle, dateStr);
}

function buildCaption(g, style, dateStr) {
  const venue    = g.venue   || "the venue";
  const city     = g.city    || "the city";
  const type     = g.type    || "event";
  const setlist  = g.setlist || "";
  const duration = g.duration|| "";
  const when     = dateStr || g.date;

  const venueTag = hashtag(g.venue) ? ` #DJ${hashtag(g.venue)}` : "";
  const cityTag  = hashtag(g.city)  ? ` #${hashtag(g.city)}`    : "";
  const hypeHashtags = `#DJ #Afrobeats #Amapiano #HipHop #RnB #Dancehall${venueTag}${cityTag}`;

  if (isUpcoming(g)) return buildUpcomingCaption(style, { venue, city, type, duration, when, hypeHashtags, cityTag });

  switch (style) {
    case 0: // Hype
      return [
        `🔥🔥🔥 WE OUTSIDE! 🔥🔥🔥`,
        ``,
        `Just locked in another one 🎧`,
        `📍 ${venue} · ${city}`,
        `📅 ${when}`,
        `${duration ? "⏱️ " + duration + " set\n" : ""}`,
        `The vibes were UNREAL. ${type} energy was on a different level tonight — the crowd gave everything back 💯`,
        ``,
        `If you weren't there... you missed 🔥`,
        ``,
        hypeHashtags,
      ].join("\n");

    case 1: // Professional
      return [
        `Grateful for another incredible night.`,
        ``,
        `📍 ${venue} · ${city}`,
        `${dateStr ? "🗓️  " + dateStr : ""}`,
        `${duration ? "⏱️  " + duration : ""}`,
        ``,
        `Playing a ${type} is always a privilege — the energy in that room reminded me exactly why I do this. Thank you to the team, the promoters, and most importantly, the crowd.`,
        ``,
        `Available for bookings 📩 — link in bio.`,
        ``,
        `#DJLife${cityTag} #LiveMusic #AfrobeatsDJ #EventDJ`,
      ].join("\n");

    case 2: // Story
      return [
        `Last night at ${venue}, ${city} 🎧`,
        ``,
        `You know those nights where everything just clicks? The mix flows perfectly, the crowd feeds you energy, and time disappears? That was last night.`,
        ``,
        `Started with the slow build, eased them in — then by hour two the whole room was moving like one. ${setlist ? "Played everything from " + setlist + "." : "Played across the whole spectrum."}`,
        ``,
        `${type} energy hits different. Always.`,
        ``,
        `More dates coming soon 👀`,
        ``,
        `#DJ${cityTag} #Afrobeats #Amapiano #DanceFloor`,
      ].join("\n");

    case 3: // Minimal
      return [
        `${venue}. ${city}.`,
        `${when}.`,
        ``,
        `🎧`,
        ``,
        `#DropSet #DJ${cityTag}`,
      ].join("\n");

    default: return "";
  }
}

// Same four styles, written as an announcement for a gig that hasn't happened yet
function buildUpcomingCaption(style, { venue, city, type, duration, when, hypeHashtags, cityTag }) {
  switch (style) {
    case 0: // Hype
      return [
        `🚨 PULL UP! 🚨`,
        ``,
        `Locked in for ${type} 🎧`,
        `📍 ${venue} · ${city}`,
        `📅 ${when}`,
        `${duration ? "⏱️ " + duration + " set\n" : ""}`,
        `Bringing the heat all night — don't be the one hearing about it the next day 🔥`,
        ``,
        `Tag who you're bringing 👇`,
        ``,
        hypeHashtags,
      ].join("\n");

    case 1: // Professional
      return [
        `Upcoming date.`,
        ``,
        `📍 ${venue} · ${city}`,
        `🗓️  ${when}`,
        `${duration ? "⏱️  " + duration : ""}`,
        ``,
        `Looking forward to playing this ${type}. Thank you to the team for having me — see you on the floor.`,
        ``,
        `Available for bookings 📩 — link in bio.`,
        ``,
        `#DJLife${cityTag} #LiveMusic #AfrobeatsDJ #EventDJ`,
      ].join("\n");

    case 2: // Story
      return [
        `Counting down to ${venue}, ${city} 🎧`,
        ``,
        `Already digging through crates and planning the build — the slow start, the moment it all locks in, and the peak you'll be talking about after.`,
        ``,
        `${type} on ${when}. Come early.`,
        ``,
        `#DJ${cityTag} #Afrobeats #Amapiano #DanceFloor`,
      ].join("\n");

    case 3: // Minimal
      return [
        `${venue}. ${city}.`,
        `${when}.`,
        ``,
        `Soon. 🎧`,
        ``,
        `#DropSet #DJ${cityTag}`,
      ].join("\n");

    default: return "";
  }
}

function copyCaption() {
  const text = document.getElementById("captionBox").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const fb = document.getElementById("captionCopyFeedback");
    fb.style.display = "block";
    setTimeout(() => fb.style.display = "none", 2500);
  });
}

function closeCaption() {
  document.getElementById("captionOverlay").style.display = "none";
  captionGig = null;
}

function closeCaptionOnOverlay(e) {
  if (e.target === document.getElementById("captionOverlay")) closeCaption();
}

// ── Export CSV ────────────────────────────────

function exportCSV() {
  const gigs = loadGigs();
  if (!gigs.length) { alert("No gigs to export."); return; }

  const headers = ["Venue","City","Date","Time","Duration","Type","Status","Pay","Pay Status","Deposit","Client","Contact","Notes","Setlist"];
  const rows = gigs.map(g => [
    g.venue, g.city, g.date, g.time||"", g.duration||"", g.type,
    g.status, g.pay||"", g.payStatus, g.deposit||"", g.client||"", g.contact||"",
    g.notes||"", g.setlist||"",
  ].map(v => `"${String(v||"").replace(/"/g,'""')}"`));

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dropset-gigs-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ── Keyboard ──────────────────────────────────

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeGigModal();
    closeDeleteModal();
    closeCaption();
  }
});

// ── Init ──────────────────────────────────────
renderGigs();
