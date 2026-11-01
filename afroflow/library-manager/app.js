// ============================================
//  DropSet – Library Manager Logic
//  All tracks stored in localStorage so they
//  persist every time you open the browser.
// ============================================

const STORAGE_KEY = "dropset_library";

// ── Helpers ──────────────────────────────────

function loadLibrary() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveLibrary(tracks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function energyColor(level) {
  if (level <= 3) return "#3a86ff";
  if (level <= 6) return "#06d6a0";
  if (level <= 8) return "#f5a623";
  return "#e05c00";
}

function energyLabel(level) {
  if (level <= 3) return `${level} – Low`;
  if (level <= 6) return `${level} – Medium`;
  if (level <= 8) return `${level} – High`;
  return `${level} – Peak`;
}

// ── Render ───────────────────────────────────

function renderTable() {
  const tracks    = loadLibrary();
  const search    = document.getElementById("searchInput").value.toLowerCase();
  const genre     = document.getElementById("filterGenre").value;
  const vibe      = document.getElementById("filterVibe").value;
  const energyF   = document.getElementById("filterEnergy").value;
  const sortBy    = document.getElementById("sortBy").value;

  let filtered = tracks.filter(t => {
    const matchSearch = !search ||
      t.title.toLowerCase().includes(search) ||
      t.artist.toLowerCase().includes(search) ||
      (t.genre || "").toLowerCase().includes(search) ||
      (t.notes || "").toLowerCase().includes(search);

    const matchGenre = !genre || t.genre === genre;
    const matchVibe  = !vibe  || (t.vibe || []).includes(vibe);
    const matchEnergy = !energyF || (
      (energyF === "low"    && t.energy >= 1 && t.energy <= 3) ||
      (energyF === "medium" && t.energy >= 4 && t.energy <= 6) ||
      (energyF === "high"   && t.energy >= 7 && t.energy <= 8) ||
      (energyF === "peak"   && t.energy >= 9)
    );
    return matchSearch && matchGenre && matchVibe && matchEnergy;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "title":     return a.title.localeCompare(b.title);
      case "artist":    return a.artist.localeCompare(b.artist);
      case "bpm":       return (a.bpm || 0) - (b.bpm || 0);
      case "energy":    return (b.energy || 0) - (a.energy || 0);
      case "genre":     return (a.genre || "").localeCompare(b.genre || "");
      default:          return (b.dateAdded || 0) - (a.dateAdded || 0);
    }
  });

  // Update count
  document.getElementById("totalCount").textContent =
    `${tracks.length} track${tracks.length !== 1 ? "s" : ""}${filtered.length !== tracks.length ? ` · ${filtered.length} shown` : ""}`;

  const tbody = document.getElementById("libraryBody");
  const emptyState = document.getElementById("emptyState");

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  tbody.innerHTML = filtered.map(t => {
    const vibes = (t.vibe || []).map(v =>
      `<span class="vibe-pill">${vibeEmoji(v)} ${escHtml(v)}</span>`
    ).join("");
    const link = isWebLink(t.link)
      ? `<a class="track-link" href="${escHtml(t.link)}" target="_blank" rel="noopener">🔗 Listen</a>`
      : "";

    return `
      <tr data-id="${t.id}">
        <td>
          <div class="track-title">${escHtml(t.title)}</div>
          <div class="track-artist">${escHtml(t.artist)}</div>
          ${link}
        </td>
        <td><span class="genre-tag">${escHtml(t.genre || "—")}</span></td>
        <td><span class="bpm-val">${t.bpm || "—"}</span></td>
        <td><span class="key-val">${escHtml(t.key || "—")}</span></td>
        <td>
          <div class="energy-wrap">
            <span class="energy-dot" style="background:${energyColor(t.energy)}"></span>
            ${energyLabel(t.energy)}
          </div>
        </td>
        <td><div class="vibe-wrap">${vibes || '<span class="vibe-pill">—</span>'}</div></td>
        <td><div class="notes-text">${escHtml(t.notes || "")}</div></td>
        <td>
          <div class="actions-wrap">
            <button class="btn-icon" onclick="editTrack('${t.id}')" title="Edit">✏️</button>
            <button class="btn-icon delete" onclick="deleteTrack('${t.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function vibeEmoji(v) {
  return { hype:"🔥", dance:"💃", mixed:"🎯", smooth:"😌" }[v] || "";
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function isWebLink(url) {
  return /^https?:\/\//i.test(url || "");
}

// ── Modal – Add / Edit ────────────────────────

let editingId = null;

function openModal(id = null) {
  editingId = id;
  clearForm();

  if (id) {
    const track = loadLibrary().find(t => t.id === id);
    if (!track) return;
    document.getElementById("modalTitle").textContent = "Edit Track";
    document.getElementById("fTitle").value  = track.title;
    document.getElementById("fArtist").value = track.artist;
    document.getElementById("fGenre").value  = track.genre || "Afrobeats";
    document.getElementById("fBpm").value    = track.bpm || "";
    document.getElementById("fKey").value    = track.key || "";
    document.getElementById("fEnergy").value = track.energy || 7;
    document.getElementById("fNotes").value  = track.notes || "";
    document.getElementById("fLink").value   = track.link || "";
    updateEnergyDisplay();
    // Set vibe checkboxes
    document.querySelectorAll("#vibeChecks input[type='checkbox']").forEach(cb => {
      cb.checked = (track.vibe || []).includes(cb.value);
    });
    // Set crowd checkboxes
    document.querySelectorAll("#crowdChecks input[type='checkbox']").forEach(cb => {
      cb.checked = (track.crowd || []).includes(cb.value);
    });
  } else {
    document.getElementById("modalTitle").textContent = "Add Track";
  }

  document.getElementById("modalOverlay").style.display = "flex";
  document.getElementById("fTitle").focus();
}

function editTrack(id) { openModal(id); }

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  editingId = null;
}

function closeModalOnOverlay(e) {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
}

function clearForm() {
  ["fTitle","fArtist","fBpm","fNotes","fLink"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("fGenre").value  = "Afrobeats";
  document.getElementById("fKey").value    = "";
  document.getElementById("fEnergy").value = 7;
  updateEnergyDisplay();
  document.querySelectorAll("#vibeChecks input, #crowdChecks input").forEach(cb => cb.checked = false);
}

function updateEnergyDisplay() {
  const val = parseInt(document.getElementById("fEnergy").value);
  document.getElementById("energyDisplay").textContent = energyLabel(val);
  document.getElementById("energyDisplay").style.color = energyColor(val);
}

function saveTrack() {
  const title  = document.getElementById("fTitle").value.trim();
  const artist = document.getElementById("fArtist").value.trim();
  if (!title || !artist) {
    alert("Please enter at least a Song Title and Artist.");
    return;
  }

  let link = document.getElementById("fLink").value.trim();
  if (link && !isWebLink(link)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(link)) {
      alert("Links must start with http:// or https://");
      return;
    }
    link = "https://" + link;
  }

  const vibes  = [...document.querySelectorAll("#vibeChecks input:checked")].map(c => c.value);
  const crowds = [...document.querySelectorAll("#crowdChecks input:checked")].map(c => c.value);

  const track = {
    id:        editingId || uid(),
    title,
    artist,
    genre:     document.getElementById("fGenre").value,
    bpm:       parseInt(document.getElementById("fBpm").value) || null,
    key:       document.getElementById("fKey").value || null,
    energy:    parseInt(document.getElementById("fEnergy").value),
    vibe:      vibes,
    crowd:     crowds,
    notes:     document.getElementById("fNotes").value.trim(),
    link,
    dateAdded: editingId
      ? (loadLibrary().find(t => t.id === editingId)?.dateAdded || Date.now())
      : Date.now(),
  };

  let tracks = loadLibrary();
  if (editingId) {
    tracks = tracks.map(t => t.id === editingId ? track : t);
  } else {
    tracks.unshift(track);
  }

  saveLibrary(tracks);
  closeModal();
  renderTable();
}

// ── Delete ───────────────────────────────────

let deletingId = null;

function deleteTrack(id) {
  const title = loadLibrary().find(t => t.id === id)?.title || "This track";
  deletingId = id;
  document.getElementById("deleteMessage").textContent =
    `"${title}" will be permanently removed from your library.`;
  document.getElementById("deleteOverlay").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("deleteOverlay").style.display = "none";
  deletingId = null;
}

function confirmDelete() {
  if (!deletingId) return;
  const tracks = loadLibrary().filter(t => t.id !== deletingId);
  saveLibrary(tracks);
  closeDeleteModal();
  renderTable();
}

// ── Import from DropSet DB ────────────────────

function importFromSetlistDB() {
  // Inline the full built-in database (same as setlist-generator/app.js)
  const BUILT_IN = [
    // African
    { title:"Last Last",         artist:"Burna Boy",              genre:"Afrobeats",  bpm:106, energy:7, vibe:["mixed","smooth","dance"],      crowd:["young","mixed"] },
    { title:"Essence",           artist:"Wizkid ft. Tems",        genre:"Afrobeats",  bpm:100, energy:6, vibe:["smooth","mixed"],              crowd:["young","mixed","mature"] },
    { title:"Ginger",            artist:"Wizkid ft. Burna",       genre:"Afrobeats",  bpm:104, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
    { title:"Ye",                artist:"Burna Boy",              genre:"Afrobeats",  bpm:98,  energy:6, vibe:["smooth","mixed"],              crowd:["mixed","mature"] },
    { title:"Bad to Me",         artist:"Rema",                   genre:"Afrobeats",  bpm:112, energy:8, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Calm Down",         artist:"Rema",                   genre:"Afrobeats",  bpm:107, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
    { title:"FEM",               artist:"Davido",                 genre:"Afrobeats",  bpm:108, energy:8, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Fall",              artist:"Davido",                 genre:"Afrobeats",  bpm:100, energy:7, vibe:["mixed","dance"],              crowd:["young","mixed","mature"] },
    { title:"Sungba",            artist:"Asake ft. Burna",        genre:"Afrobeats",  bpm:110, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Oliver Twist",      artist:"Dbanj",                  genre:"Afrobeats",  bpm:118, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Johnny",            artist:"Yemi Alade",             genre:"Afrobeats",  bpm:102, energy:7, vibe:["mixed","dance"],              crowd:["young","mixed","mature"] },
    { title:"Asibe Happy",       artist:"Kabza De Small",         genre:"Amapiano",   bpm:114, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
    { title:"Siyathandana",      artist:"Kabza & Ami Faku",       genre:"Amapiano",   bpm:112, energy:7, vibe:["mixed","dance"],              crowd:["young","mixed"] },
    { title:"John Vuli Gate",    artist:"Mapara A Jazz",          genre:"Amapiano",   bpm:110, energy:8, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Ke Star",           artist:"Focalistic",             genre:"Amapiano",   bpm:116, energy:9, vibe:["hype","dance"],               crowd:["young"] },
    { title:"Buga",              artist:"Kizz Daniel",            genre:"Afro-Pop",   bpm:106, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed","mature"] },
    { title:"KPK",               artist:"Rexxie ft. Mohbad",      genre:"Afro-Pop",   bpm:115, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Superman",          artist:"Black Coffee",           genre:"Afro House", bpm:122, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Drive",             artist:"Black Coffee",           genre:"Afro House", bpm:118, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
    // Hip-Hop
    { title:"SICKO MODE",        artist:"Travis Scott",           genre:"Trap",       bpm:155, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Bad and Boujee",    artist:"Migos",                  genre:"Trap",       bpm:130, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Rockstar",          artist:"Post Malone ft. 21",     genre:"Trap",       bpm:160, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
    { title:"California Love",   artist:"2Pac ft. Dr. Dre",       genre:"Old School", bpm:100, energy:9, vibe:["hype","dance"],               crowd:["mixed","mature"] },
    { title:"Hypnotize",         artist:"Biggie",                 genre:"Old School", bpm:95,  energy:8, vibe:["hype","dance","mixed"],        crowd:["mixed","mature"] },
    { title:"Lose Yourself",     artist:"Eminem",                 genre:"Old School", bpm:171, energy:10,vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"In Da Club",        artist:"50 Cent",                genre:"Old School", bpm:90,  energy:9, vibe:["hype","dance"],               crowd:["mixed","mature"] },
    { title:"Hey Ya!",           artist:"OutKast",                genre:"Old School", bpm:160, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Welcome to the Party",artist:"Pop Smoke",            genre:"Drill",      bpm:140, energy:10,vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"War",               artist:"Central Cee",            genre:"Drill",      bpm:140, energy:9, vibe:["hype","dance"],               crowd:["young"] },
    { title:"Alright",           artist:"Kendrick Lamar",         genre:"Conscious",  bpm:89,  energy:8, vibe:["hype","mixed","dance"],        crowd:["young","mixed","mature"] },
    { title:"Fight the Power",   artist:"Public Enemy",           genre:"Conscious",  bpm:109, energy:9, vibe:["hype","dance"],               crowd:["mixed","mature"] },
    // R&B & Soul
    { title:"Crazy in Love",     artist:"Beyoncé ft. Jay-Z",      genre:"R&B",        bpm:99,  energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Say My Name",       artist:"Destiny's Child",        genre:"R&B",        bpm:110, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed","mature"] },
    { title:"Pony",              artist:"Ginuwine",               genre:"R&B",        bpm:94,  energy:8, vibe:["hype","dance"],               crowd:["mixed","mature"] },
    { title:"Leave the Door Open",artist:"Silk Sonic",            genre:"R&B",        bpm:95,  energy:6, vibe:["smooth","mixed"],             crowd:["mixed","mature"] },
    { title:"On & On",           artist:"Erykah Badu",            genre:"Neo-Soul",   bpm:92,  energy:5, vibe:["smooth"],                     crowd:["mixed","mature"] },
    { title:"Golden",            artist:"Jill Scott",             genre:"Neo-Soul",   bpm:86,  energy:6, vibe:["smooth","mixed"],             crowd:["mixed","mature"] },
    { title:"Sweetest Taboo",    artist:"Sade",                   genre:"Quiet Storm",bpm:96,  energy:5, vibe:["smooth"],                     crowd:["mature"] },
    { title:"No Ordinary Love",  artist:"Sade",                   genre:"Quiet Storm",bpm:72,  energy:4, vibe:["smooth"],                     crowd:["mature"] },
    { title:"Signed Sealed Delivered",artist:"Stevie Wonder",     genre:"Motown",     bpm:110, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"I Want You Back",   artist:"The Jackson 5",          genre:"Motown",     bpm:118, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Superstition",      artist:"Stevie Wonder",          genre:"Motown",     bpm:100, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    // Reggae & Latin
    { title:"Despacito",         artist:"Luis Fonsi ft. Daddy Yankee",genre:"Reggaeton",bpm:89,energy:8,vibe:["hype","dance","mixed"],        crowd:["young","mixed","mature"] },
    { title:"Mi Gente",          artist:"J Balvin & Willy William",genre:"Reggaeton", bpm:100, energy:9, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"Gasolina",          artist:"Daddy Yankee",           genre:"Reggaeton",  bpm:100, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Vivir Mi Vida",     artist:"Marc Anthony",           genre:"Salsa",      bpm:170, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"La Vida Es Un Carnaval",artist:"Celia Cruz",         genre:"Salsa",      bpm:174, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Mas Que Nada",      artist:"Sergio Mendes",          genre:"Samba",      bpm:120, energy:8, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Temperature",       artist:"Sean Paul",              genre:"Dancehall",  bpm:102, energy:9, vibe:["hype","dance"],               crowd:["young","mixed","mature"] },
    { title:"Work",              artist:"Rihanna ft. Drake",      genre:"Dancehall",  bpm:92,  energy:8, vibe:["hype","dance"],               crowd:["young","mixed"] },
    { title:"One Dance",         artist:"Drake ft. Rihanna",      genre:"Dancehall",  bpm:104, energy:8, vibe:["hype","dance","mixed"],        crowd:["young","mixed"] },
  ];

  const existing = loadLibrary();
  const existingKeys = new Set(existing.map(t => `${t.title}|||${t.artist}`));
  let added = 0;

  const newTracks = BUILT_IN
    .filter(t => !existingKeys.has(`${t.title}|||${t.artist}`))
    .map(t => ({ ...t, id: uid(), notes: "", link: "", key: null, dateAdded: Date.now() }));

  added = newTracks.length;
  saveLibrary([...newTracks, ...existing]);
  renderTable();

  if (added === 0) {
    alert("✅ All built-in tracks are already in your library!");
  } else {
    alert(`✅ Imported ${added} tracks into your library!`);
  }
}

// ── Export CSV ───────────────────────────────

function exportCSV() {
  const tracks = loadLibrary();
  if (tracks.length === 0) { alert("Your library is empty."); return; }

  const headers = ["Title","Artist","Genre","BPM","Key","Energy","Vibe","Crowd","Notes","Link"];
  const rows = tracks.map(t => [
    t.title, t.artist, t.genre || "", t.bpm || "", t.key || "",
    t.energy, (t.vibe || []).join("|"), (t.crowd || []).join("|"),
    t.notes || "", t.link || "",
  ].map(v => `"${String(v).replace(/"/g,'""')}"`));

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dropset-library-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ── Keyboard shortcuts ───────────────────────

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeDeleteModal(); }
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    document.getElementById("searchInput").focus();
  }
});

// ── Init ─────────────────────────────────────
renderTable();
