// ============================================
//  DropSet – Backup & Restore
//  Saves your Library, Gigs and Press Kit to one .json
//  file, and loads them back from it. Use it to
//  keep a safe copy or to move to another
//  browser / computer.
// ============================================

const BACKUP_KEYS = { library: "dropset_library", gigs: "dropset_gigs", epk: "dropset_epk" };
const LAST_BACKUP_KEY = "dropset_last_backup";
const BACKUP_VERSION = 1;

// ── Storage helpers ──────────────────────────

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function readEpk() {
  try { return JSON.parse(localStorage.getItem(BACKUP_KEYS.epk)); }
  catch { return null; }
}

// True when a press kit has something filled in
function hasPressKit(epk) {
  if (!epk || typeof epk !== "object") return false;
  const filled = v => typeof v === "string" && v.trim() !== "";
  return filled(epk.name) || filled(epk.bio) ||
    (Array.isArray(epk.mixes) && epk.mixes.length > 0) ||
    (Array.isArray(epk.videos) && epk.videos.length > 0) ||
    Object.values(epk.contact || {}).some(filled);
}

function backupId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Pure logic (no page needed) ──────────────

function buildBackup(library, gigs, now = new Date(), epk = null) {
  return {
    app: "DropSet",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    library,
    gigs,
    ...(hasPressKit(epk) ? { epk } : {}),
  };
}

// Reads a backup file's text. Returns { library, gigs, epk, exportedAt, skipped }
// or throws an Error with a message that can be shown to the DJ.
function parseBackup(text) {
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error("This file isn't a DropSet backup (it couldn't be read)."); }

  if (!data || data.app !== "DropSet") {
    throw new Error("This file isn't a DropSet backup.");
  }
  if (data.version > BACKUP_VERSION) {
    throw new Error("This backup was made by a newer version of DropSet. Update DropSet and try again.");
  }

  const rawLibrary = Array.isArray(data.library) ? data.library : [];
  const rawGigs    = Array.isArray(data.gigs)    ? data.gigs    : [];

  const isText = v => typeof v === "string" && v.trim() !== "";
  const library = rawLibrary
    .filter(t => t && isText(t.title) && isText(t.artist))
    .map(t => ({ ...t, id: isText(t.id) ? t.id : backupId() }));
  const gigs = rawGigs
    .filter(g => g && isText(g.venue) && isText(g.date))
    .map(g => ({ ...g, id: isText(g.id) ? g.id : backupId() }));

  return {
    library,
    gigs,
    epk: hasPressKit(data.epk) ? data.epk : null,
    exportedAt: data.exportedAt || null,
    skipped: (rawLibrary.length - library.length) + (rawGigs.length - gigs.length),
  };
}

// Keeps everything already in `current` and adds backup items that aren't
// there yet. An item counts as "already there" if it has the same id, or the
// same title + artist (tracks) / venue + date (gigs).
function mergeLists(current, incoming, sameKey) {
  const ids  = new Set(current.map(x => x.id));
  const keys = new Set(current.map(sameKey));
  const added = incoming.filter(x => {
    if (ids.has(x.id) || keys.has(sameKey(x))) return false;
    ids.add(x.id);
    keys.add(sameKey(x));
    return true;
  });
  return { list: [...current, ...added], added: added.length };
}

const trackKey = t => `${t.title}|${t.artist}`.toLowerCase();
const gigKey   = g => `${g.venue}|${g.date}`.toLowerCase();

// ── Page ─────────────────────────────────────

let pendingRestore = null;

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderBackupStatus() {
  const tracks = readList(BACKUP_KEYS.library).length;
  const gigs   = readList(BACKUP_KEYS.gigs).length;
  const kit    = hasPressKit(readEpk());
  const last   = localStorage.getItem(LAST_BACKUP_KEY);

  document.getElementById("dataCounts").textContent =
    `📚 ${plural(tracks, "track")} · 🎤 ${plural(gigs, "gig")}` + (kit ? " · 📰 Press kit" : "");

  const status = document.getElementById("lastBackup");
  const hasData = tracks + gigs > 0 || kit;
  const stale = !last || Date.now() - new Date(last).getTime() > 14 * 86400000;
  status.textContent = last
    ? `Last backup: ${timeAgo(last)}`
    : hasData ? "Never backed up" : "Nothing to back up yet";
  status.classList.toggle("warn", hasData && stale);
}

function showBackupMessage(text, kind = "ok") {
  const el = document.getElementById("backupMessage");
  el.textContent = text;
  el.className = `backup-message ${kind}`;
  el.style.display = text ? "block" : "none";
}

function downloadBackup() {
  const library = readList(BACKUP_KEYS.library);
  const gigs    = readList(BACKUP_KEYS.gigs);
  const epk     = readEpk();
  if (library.length + gigs.length === 0 && !hasPressKit(epk)) {
    showBackupMessage("Nothing to back up yet — add some tracks, gigs or your press kit first.", "error");
    return;
  }

  const now = new Date();
  const blob = new Blob([JSON.stringify(buildBackup(library, gigs, now, epk), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dropset-backup-${now.toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
  renderBackupStatus();
  showBackupMessage(`✅ Backup saved: ${plural(library.length, "track")}, ${plural(gigs.length, "gig")}${hasPressKit(epk) ? " and your press kit" : ""}. Keep the file somewhere safe (e.g. Google Drive or email it to yourself).`);
}

function chooseRestoreFile() {
  showBackupMessage("");
  const input = document.getElementById("restoreFile");
  input.value = "";
  input.click();
}

function onRestoreFileChosen(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      pendingRestore = parseBackup(reader.result);
    } catch (err) {
      closeRestorePanel();
      showBackupMessage(`⚠️ ${err.message}`, "error");
      return;
    }
    const r = pendingRestore;
    const from = r.exportedAt ? ` from ${fmtDate(r.exportedAt)}` : "";
    document.getElementById("restoreSummary").textContent =
      `This backup${from} has ${plural(r.library.length, "track")}, ${plural(r.gigs.length, "gig")}` +
      (r.epk ? ` and a press kit${r.epk.name ? ` (${r.epk.name})` : ""}.` : " and no press kit.") +
      (r.skipped ? ` (${plural(r.skipped, "damaged entry")} will be skipped.)` : "");
    const curTracks = readList(BACKUP_KEYS.library).length;
    const curGigs   = readList(BACKUP_KEYS.gigs).length;
    document.getElementById("replaceWarning").textContent =
      `Replace deletes your current ${plural(curTracks, "track")} and ${plural(curGigs, "gig")} first` +
      (r.epk && hasPressKit(readEpk()) ? ", and swaps your press kit for the one in the backup." : ".");
    document.getElementById("restorePanel").style.display = "block";
  };
  reader.onerror = () => showBackupMessage("⚠️ That file couldn't be opened.", "error");
  reader.readAsText(file);
}

function restoreBackup(mode) {
  if (!pendingRestore) return;
  const { library, gigs, epk } = pendingRestore;

  if (mode === "replace") {
    writeList(BACKUP_KEYS.library, library);
    writeList(BACKUP_KEYS.gigs, gigs);
    // Older backups have no press kit: keep the current one rather than wiping it
    if (epk) localStorage.setItem(BACKUP_KEYS.epk, JSON.stringify(epk));
    showBackupMessage(`✅ Restored ${plural(library.length, "track")}, ${plural(gigs.length, "gig")}${epk ? " and your press kit" : ""}.`);
  } else {
    const lib = mergeLists(readList(BACKUP_KEYS.library), library, trackKey);
    const gig = mergeLists(readList(BACKUP_KEYS.gigs), gigs, gigKey);
    // A press kit can't be half-merged: only fill it in if you don't have one yet
    const kitAdded = !!epk && !hasPressKit(readEpk());
    writeList(BACKUP_KEYS.library, lib.list);
    writeList(BACKUP_KEYS.gigs, gig.list);
    if (kitAdded) localStorage.setItem(BACKUP_KEYS.epk, JSON.stringify(epk));
    showBackupMessage(lib.added + gig.added || kitAdded
      ? `✅ Added ${plural(lib.added, "track")}, ${plural(gig.added, "gig")}${kitAdded ? " and your press kit" : ""} from the backup. Nothing you already had was changed.`
      : "✅ You already have everything in this backup — nothing new to add.");
  }

  closeRestorePanel();
  renderBackupStatus();
}

function closeRestorePanel() {
  pendingRestore = null;
  document.getElementById("restorePanel").style.display = "none";
}

if (typeof document !== "undefined" && document.getElementById("backupSection")) {
  document.getElementById("restoreFile").addEventListener("change", onRestoreFileChosen);
  window.addEventListener("storage", renderBackupStatus);
  window.addEventListener("pageshow", renderBackupStatus);
  renderBackupStatus();
}
