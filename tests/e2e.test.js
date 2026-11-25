// End-to-end browser tests for every DropSet page and tool.
// Run with: npm test   (from this folder)
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright-core");

const ROOT = pathToFileURL(path.resolve(__dirname, "..") + "/").href;
// Uses your installed Chrome. Set CHROME_PATH to point somewhere else.
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Future dates are relative to today so the tests keep passing in later years
const NEXT_YEAR = String(new Date().getFullYear() + 1);
const results = [];
const check = (name, ok, info = "") => { results.push({ name, ok, info }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? "  — " + info : ""}`); };

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"]);

  async function open(path) {
    const page = await ctx.newPage();
    const errors = [];
    const dialogs = [];
    page.on("pageerror", e => errors.push(e.message));
    // Ignore network noise, and Chrome's "unload is not allowed" message, which
    // the embedded Mixcloud player sometimes triggers (none of our code uses unload).
    page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR|Permissions policy violation: unload is not allowed/.test(m.text())) errors.push(m.text()); });
    page.on("dialog", d => { dialogs.push(d.message()); d.accept(); });
    await page.goto(ROOT + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    return { page, errors, dialogs };
  }

  // ── Smoke: every page loads without JS errors ──
  for (const p of ["afroflow/index.html", "afroflow/setlist-generator/index.html", "afroflow/library-manager/index.html",
    "afroflow/gig-tracker/index.html", "afroflow/caption-generator/index.html", "afroflow/epk/index.html",
    "dropset-landing.html"]) {
    const { page, errors } = await open(p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check(`load ${p}`, errors.length === 0, errors.join(" | "));
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForTimeout(150);
    const mob = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`mobile no horizontal scroll ${p}`, mob <= 1, mob > 1 ? `${mob}px overflow` : "");
    await page.close();
  }

  // ── Setlist generator ──
  {
    const { page, errors } = await open("afroflow/setlist-generator/index.html");
    check("setlist: empty library → defaults to DropSet DB", (await page.inputValue("#source")) === "builtin");
    await page.click(".btn-generate");
    const n = await page.locator("#setlistBody tr").count();
    check("setlist: default (2h mixed mix) generates 30 tracks", n === 30, `got ${n}`);
    await page.selectOption("#genre", "quietstorm"); await page.selectOption("#vibe", "hype");
    await page.click(".btn-generate");
    const n2 = await page.locator("#setlistBody tr").count();
    const meta = await page.textContent("#outputMeta");
    check("setlist: quiet storm + hype yields tracks and a warning", n2 > 0 && meta.includes("Only"), `got ${n2} rows; meta="${meta.replace(/\s+/g, " ")}"`);
    await page.selectOption("#genre", "mix"); await page.selectOption("#vibe", "mixed");
    await page.fill("#opener", "Burna Boy - Last Last");
    await page.click(".btn-generate");
    const first = await page.textContent("#setlistBody tr:first-child .track-name");
    check("setlist: opener typed with normal hyphen is parsed", first.trim() === "Last Last", `name="${first.trim()}"`);
    await page.fill("#opener", "<img src=x onerror=window.__xss=1>");
    await page.click(".btn-generate"); await page.waitForTimeout(200);
    check("setlist: opener text is escaped (no HTML injection)", !(await page.evaluate(() => window.__xss)));
    await page.fill("#opener", "");
    await page.click(".btn-generate");
    await page.click("text=Copy to Clipboard");
    await page.waitForTimeout(200);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    check("setlist: copy to clipboard", clip.split("\n").length === 31, `${clip.split("\n").length} lines`);
    const dupes = await page.$$eval("#setlistBody .track-name", els => { const s = els.map(e => e.textContent); return s.length - new Set(s).size; });
    check("setlist: no duplicate songs in a set", dupes === 0, `${dupes} dupes`);
    check("setlist: no JS errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ── Library manager ──
  {
    const { page, errors, dialogs } = await open("afroflow/library-manager/index.html");
    await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(200);
    await page.click("text=Import DropSet DB");
    const count = await page.locator("#libraryBody tr").count();
    check("library: import DB", count > 0, `${count} tracks imported; dialog="${dialogs.at(-1)}"`);
    await page.click("text=Import DropSet DB");
    check("library: re-import adds no duplicates", (await page.locator("#libraryBody tr").count()) === count);

    // Add a track with crowd = Mature only, vibe = Smooth only
    await page.click("text=+ Add Track");
    await page.fill("#fTitle", `12" Remix`); await page.fill("#fArtist", "Test's Artist");
    await page.check(".vibe-checks >> nth=0 >> input[value=smooth]");
    await page.check(".vibe-checks >> nth=1 >> input[value=mature]");
    await page.click("text=Save Track");
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("dropset_library")).find(t => t.title === `12" Remix`));
    check("library: vibe saved correctly", JSON.stringify(saved.vibe) === '["smooth"]', `vibe=${JSON.stringify(saved.vibe)}`);
    await page.locator("#libraryBody tr", { hasText: "Remix" }).locator("text=✏️").click();
    const boxes = await page.$$eval("#modalOverlay input[type=checkbox]:checked", e => e.map(x => x.value));
    check("library: edit modal re-ticks the right boxes", JSON.stringify(boxes) === '["smooth","mature"]', JSON.stringify(boxes));
    await page.click("text=+ Add Track").catch(()=>{}); await page.keyboard.press("Escape");
    await page.click("text=+ Add Track");
    const cleared = await page.$$eval("#modalOverlay input[type=checkbox]:checked", e => e.length);
    check("library: Add Track opens with all boxes cleared", cleared === 0, `${cleared} still ticked`);
    await page.keyboard.press("Escape");
    check("library: crowd saved correctly", JSON.stringify(saved.crowd) === '["mature"]', `crowd=${JSON.stringify(saved.crowd)}`);

    // Delete button for a title with a double quote
    const row = page.locator("#libraryBody tr", { hasText: "Remix" });
    await row.locator(".btn-icon.delete").click(); await page.waitForTimeout(150);
    const delVisible = await page.isVisible("#deleteOverlay");
    check(`library: delete works for title containing a " quote`, delVisible, delVisible ? "" : "delete dialog did not open");
    if (delVisible) await page.click(".btn-danger");
    check("library: track actually deleted", (await page.locator("#libraryBody tr", { hasText: "Remix" }).count()) === 0);

    // Edit flow round trip
    await page.locator("#libraryBody tr").first().locator("text=✏️").click();
    await page.fill("#fNotes", "edited note"); await page.click("text=Save Track");
    const edited = await page.evaluate(() => JSON.parse(localStorage.getItem("dropset_library")).filter(t => t.notes === "edited note").length);
    check("library: edit saves in place", edited === 1);

    await page.fill("#searchInput", "burna");
    const s = await page.locator("#libraryBody tr").count();
    check("library: search filters", s > 0 && s < count, `${s} rows`);
    await page.fill("#searchInput", "");
    await page.selectOption("#filterEnergy", "peak");
    const pk = await page.$$eval("#libraryBody .energy-wrap", e => e.every(x => /(9|10) – Peak/.test(x.textContent)));
    check("library: energy filter", pk);

    // Malicious link
    await page.selectOption("#filterEnergy", "");
    await page.click("text=+ Add Track");
    await page.fill("#fTitle", "LinkTest"); await page.fill("#fArtist", "A");
    await page.fill("#fLink", `javascript:window.__xss=1`); await page.click("text=Save Track");
    const href = await page.getAttribute("#libraryBody tr:has-text('LinkTest') a.track-link", "href").catch(() => null);
    check("library: rejects javascript: links", !href || !href.startsWith("javascript"), `href=${href}`);
    await page.keyboard.press("Escape");
    await page.click("text=+ Add Track");
    await page.fill("#fTitle", "NoScheme"); await page.fill("#fArtist", "A"); await page.fill("#fLink", "soundcloud.com/x");
    await page.click("text=Save Track");
    const h2 = await page.getAttribute("#libraryBody tr:has-text('NoScheme') a.track-link", "href");
    check("library: link without https:// gets it added", h2 === "https://soundcloud.com/x", h2);

    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=Export CSV")]);
    check("library: CSV export downloads", !!dl.suggestedFilename(), dl.suggestedFilename());
    check("library: no JS errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ── Setlist Generator ↔ Library ──
  {
    const lib = await open("afroflow/library-manager/index.html");
    await lib.page.evaluate(() => localStorage.clear()); await lib.page.reload(); await lib.page.waitForTimeout(200);
    for (const [title, genre] of [["My Afro Jam", "Afrobeats"], ["My Other Jam", "Afrobeats"], ["My Trap Song", "Trap"]]) {
      await lib.page.click("text=+ Add Track");
      await lib.page.fill("#fTitle", title); await lib.page.fill("#fArtist", "DJ Me");
      await lib.page.selectOption("#fGenre", genre);
      await lib.page.click("text=Save Track");
    }
    const { page, errors } = await open("afroflow/setlist-generator/index.html");
    check("setlist+library: defaults to My Library when it has tracks", (await page.inputValue("#source")) === "library");
    check("setlist+library: hint shows library size", (await page.textContent("#sourceHint")).includes("3 tracks"));
    await page.selectOption("#genre", "afrobeats"); await page.selectOption("#duration", "60");
    await page.click(".btn-generate");
    const names = await page.$$eval("#setlistBody .track-name", e => e.map(x => x.textContent).sort());
    check("setlist+library: My Library builds from your tracks only", JSON.stringify(names) === '["My Afro Jam","My Other Jam"]', names.join(", "));
    check("setlist+library: rows marked 📚", (await page.locator("#setlistBody .lib-mark").count()) === 2);
    check("setlist+library: short-set tip points to Library Manager", (await page.textContent("#outputMeta")).includes("Library Manager"));
    await page.selectOption("#source", "both");
    await page.click(".btn-generate");
    const rows = await page.locator("#setlistBody tr").count();
    const libRows = await page.locator("#setlistBody .lib-mark").count();
    check("setlist+library: Library + DropSet DB fills the set incl. your tracks", rows === 15 && libRows === 2, `${rows} rows, ${libRows} yours`);
    await page.click("text=Copy to Clipboard"); await page.waitForTimeout(200);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    check("setlist+library: copied setlist has clean genre column", clip.includes("My Afro Jam\tDJ Me\tAfrobeats\t"), clip.split("\n").find(l => l.includes("My Afro")));
    // Library edited in another tab → hint updates without reload
    await lib.page.click("text=+ Add Track");
    await lib.page.fill("#fTitle", "Fourth"); await lib.page.fill("#fArtist", "DJ Me"); await lib.page.click("text=Save Track");
    await page.waitForTimeout(300);
    check("setlist+library: hint updates when library changes in another tab", (await page.textContent("#sourceHint")).includes("4 tracks"));
    check("setlist+library: no JS errors", errors.length === 0 && lib.errors.length === 0, [...errors, ...lib.errors].join(" | "));
    await lib.page.evaluate(() => localStorage.clear());
    await page.close(); await lib.page.close();
  }

  // ── Backup & Restore (home page) ──
  {
    const fs = require("fs");
    const { page, errors } = await open("afroflow/index.html");
    const seed = (lib, gigs) => page.evaluate(([l, g]) => {
      localStorage.clear();
      localStorage.setItem("dropset_library", JSON.stringify(l));
      localStorage.setItem("dropset_gigs", JSON.stringify(g));
    }, [lib, gigs]);
    const stored = () => page.evaluate(() => ({
      library: JSON.parse(localStorage.getItem("dropset_library") || "[]"),
      gigs: JSON.parse(localStorage.getItem("dropset_gigs") || "[]"),
    }));
    const restoreFrom = async buffer => {
      await page.setInputFiles("#restoreFile", { name: "backup.json", mimeType: "application/json", buffer: Buffer.from(buffer) });
      await page.waitForTimeout(200);
    };

    await seed([], []); await page.reload(); await page.waitForTimeout(200);
    await page.click("#downloadBackupBtn");
    check("backup: nothing to back up → friendly message", (await page.textContent("#backupMessage")).includes("Nothing to back up"));

    const lib = [{ id: "t1", title: "Last Last", artist: "Burna Boy", genre: "Afrobeats", energy: 7, vibe: [], crowd: [] },
                 { id: "t2", title: "My Jam", artist: "DJ Me", genre: "Amapiano", energy: 8, vibe: ["hype"], crowd: ["young"] }];
    const gigs = [{ id: "g1", venue: "Club Lagos", city: "Tel Aviv", date: "2026-09-01", status: "completed", pay: 500, payStatus: "paid" }];
    await seed(lib, gigs); await page.reload(); await page.waitForTimeout(200);
    check("backup: shows how much data you have", (await page.textContent("#dataCounts")).includes("2 tracks · 🎤 1 gig"), await page.textContent("#dataCounts"));
    check("backup: warns when never backed up", (await page.textContent("#lastBackup")) === "Never backed up" && await page.locator("#lastBackup.warn").count() === 1);

    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#downloadBackupBtn")]);
    const file = fs.readFileSync(await dl.path(), "utf8");
    const parsed = JSON.parse(file);
    check("backup: downloads a dated .json file", /^dropset-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    check("backup: file contains all tracks and gigs", parsed.app === "DropSet" && parsed.library.length === 2 && parsed.gigs.length === 1);
    check("backup: last-backup shows today, warning cleared", (await page.textContent("#lastBackup")) === "Last backup: today" && await page.locator("#lastBackup.warn").count() === 0);

    // Merge: you deleted a track and added a new one since the backup
    await seed([lib[1], { id: "t9", title: "Brand New", artist: "DJ Me" }], []); await page.reload(); await page.waitForTimeout(200);
    await restoreFrom(file);
    check("restore: preview shows what's in the file", (await page.textContent("#restoreSummary")).includes("2 tracks, 1 gig and no press kit"), await page.textContent("#restoreSummary"));
    check("restore: nothing changes until you choose", (await stored()).library.length === 2);
    await page.click("#mergeBtn");
    let st = await stored();
    check("restore merge: keeps new data and brings back what was lost",
      st.library.map(t => t.title).sort().join(",") === "Brand New,Last Last,My Jam" && st.gigs.length === 1, st.library.map(t => t.title).join(","));
    check("restore merge: message says what was added", (await page.textContent("#backupMessage")).includes("Added 1 track, 1 gig from"), await page.textContent("#backupMessage"));
    await restoreFrom(file); await page.click("#mergeBtn");
    check("restore merge twice: nothing duplicated", (await stored()).library.length === 3 && (await page.textContent("#backupMessage")).includes("already have everything"));

    // Replace
    await restoreFrom(file);
    check("restore: replace warning shows what will be deleted", (await page.textContent("#replaceWarning")).includes("3 tracks and 1 gig first"));
    await page.click("#replaceBtn");
    st = await stored();
    check("restore replace: data matches the backup exactly", JSON.stringify(st.library) === JSON.stringify(lib) && JSON.stringify(st.gigs) === JSON.stringify(gigs));
    check("restore: counts update after restore", (await page.textContent("#dataCounts")).includes("2 tracks"));

    // Cancel
    await restoreFrom(JSON.stringify({ app: "DropSet", version: 1, library: [], gigs: [] }));
    await page.click("#restorePanel >> text=Cancel");
    check("restore: cancel leaves data alone", (await stored()).library.length === 2 && !(await page.isVisible("#restorePanel")));

    // Bad files
    await restoreFrom("this is not json");
    check("restore: rejects a non-backup file", (await page.textContent("#backupMessage")).includes("isn't a DropSet backup") && !(await page.isVisible("#restorePanel")));
    await restoreFrom(JSON.stringify({ app: "DropSet", version: 1, library: [{ title: "ok", artist: "a" }, { title: "" }], gigs: [] }));
    check("restore: damaged entries are reported", (await page.textContent("#restoreSummary")).includes("1 damaged entry will be skipped"));
    await page.click("#restorePanel >> text=Cancel");
    check("restore: data still safe after bad files", (await stored()).library.length === 2);

    // Restored data shows up in the tools
    const lm = await open("afroflow/library-manager/index.html");
    check("restore: Library Manager shows restored tracks", (await lm.page.locator("#libraryBody tr").count()) === 2);
    const gt = await open("afroflow/gig-tracker/index.html");
    check("restore: Gig Tracker shows restored gigs", (await gt.page.locator(".gig-card").count()) === 1);
    check("backup: no JS errors", errors.length === 0 && lm.errors.length === 0 && gt.errors.length === 0, [...errors, ...lm.errors, ...gt.errors].join(" | "));
    await page.evaluate(() => localStorage.clear());
    await page.close(); await lm.page.close(); await gt.page.close();
  }

  // ── EPK / Press Kit ──
  {
    const fs = require("fs");
    // DropSet is for any DJ: no one DJ's personal details in the product
    const productFiles = ["afroflow/epk/index.html", "afroflow/epk/app.js", "afroflow/epk/style.css", "dropset-landing.html"];
    for (const f of productFiles) {
      const personal = fs.readFileSync(path.resolve(__dirname, "..", f), "utf8").match(/taban|odiel|972|535\s?533/gi);
      check(`no personal DJ details in ${f}`, !personal, personal?.join(", "));
    }

    const { page, errors } = await open("afroflow/epk/index.html");
    await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(200);
    check("epk: empty press kit shows the welcome card", await page.isVisible("#welcome") && !(await page.isVisible("#kit")));
    await page.click("#welcome button");
    check("epk: Start opens the editor", await page.evaluate(() => document.body.classList.contains("editing")));

    await page.fill("#fName", "DJ Nova");
    check("epk: page appears as soon as you type a name", await page.isVisible("#kit") && (await page.textContent(".dj-name")) === "DJ Nova");
    await page.fill("#fTagline", "Afrobeats · Amapiano");
    await page.fill("#fLocation", "London, UK");
    await page.fill("#fBio", "Line one\nLine two");
    await page.fill("[data-stat='0'][data-field='number']", "150+");
    await page.click("#genreChoices >> text=Afrobeats");
    await page.fill("#genreCustom", "Gqom"); await page.press("#genreCustom", "Enter");
    await page.click("[data-add='mixes']");
    await page.fill("#mixFields input[data-field='title']", "Summer Mix");
    await page.fill("#mixFields input[data-field='url']", "https://www.mixcloud.com/djnova/summer-mix/");
    await page.click("[data-add='mixes']");
    await page.fill("#mixFields .list-row:nth-child(2) input[data-field='title']", "SC Mix");
    await page.fill("#mixFields .list-row:nth-child(2) input[data-field='url']", "soundcloud.com/djnova/sc-mix");
    await page.fill("#fYoutube", "youtube.com/@djnova");
    await page.click("[data-add='videos']");
    await page.fill("#videoFields input", "https://youtu.be/abc123XYZ_9");
    await page.click("[data-add='venues']");
    await page.fill("#venueFields input[data-field='name']", "Club XO – London");
    await page.fill("#venueFields input[data-field='year']", "2026");
    await page.fill("#c_email", "nova@example.com");
    await page.fill("#c_instagram", "@djnova");
    await page.fill("#c_whatsapp", "+44 7700 900000");
    await page.fill("#c_website", "javascript:alert(1)");
    await page.setInputFiles("#photoInput", { name: "me.png", mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") });
    await page.waitForTimeout(400);
    await page.click("text=✓ Done");
    check("epk: Done closes the editor", !(await page.evaluate(() => document.body.classList.contains("editing"))));

    const kit = await page.evaluate(() => ({
      tagline: document.querySelector(".dj-tagline")?.textContent,
      location: document.querySelector(".dj-location")?.textContent,
      bioBreak: document.querySelector(".bio")?.innerHTML.includes("<br>"),
      stats: [...document.querySelectorAll(".stat-card")].map(x => x.textContent.replace(/\s+/g, " ").trim()),
      genres: [...document.querySelectorAll(".hero-tag")].map(x => x.textContent),
      mixcloud: document.querySelector("iframe[src*='player-widget.mixcloud.com']")?.src,
      soundcloud: document.querySelector("iframe[src*='w.soundcloud.com']")?.src,
      thumb: document.querySelector(".yt-thumb img")?.src,
      channel: document.querySelector(".btn-yt")?.href,
      venue: document.querySelector(".venue-name")?.textContent,
      ig: document.querySelector("a[href*='instagram.com']")?.href,
      wa: document.querySelector("a[href^='https://wa.me/']")?.href,
      cta: document.querySelector(".btn-book-cta")?.href,
      badLink: !!document.querySelector("#kit a[href^='javascript']"),
      photo: document.querySelector(".hero-photo")?.src.slice(0, 22),
      sections: [...document.querySelectorAll("#kit section[id]")].map(x => x.id),
    }));
    check("epk: basics shown", kit.tagline === "Afrobeats · Amapiano" && kit.location === "📍 London, UK" && kit.bioBreak, JSON.stringify([kit.tagline, kit.location]));
    check("epk: only filled stats shown, with default label", JSON.stringify(kit.stats) === '["150+ Events Played"]', JSON.stringify(kit.stats));
    check("epk: genres incl. custom one", JSON.stringify(kit.genres) === '["Afrobeats","Gqom"]', JSON.stringify(kit.genres));
    check("epk: Mixcloud link becomes a player", (kit.mixcloud || "").includes("feed=%2Fdjnova%2Fsummer-mix%2F"), kit.mixcloud);
    check("epk: SoundCloud link (no https) becomes a player", (kit.soundcloud || "").includes(encodeURIComponent("https://soundcloud.com/djnova/sc-mix")), kit.soundcloud);
    check("epk: YouTube video thumbnail + channel", (kit.thumb || "").includes("/vi/abc123XYZ_9/") && kit.channel === "https://youtube.com/@djnova");
    check("epk: venue shown", kit.venue === "Club XO – London");
    check("epk: Instagram handle → profile link", kit.ig === "https://www.instagram.com/djnova", kit.ig);
    check("epk: WhatsApp link uses digits + DJ's name", (kit.wa || "").startsWith("https://wa.me/447700900000?text=Hi%20DJ%20Nova"), kit.wa);
    check("epk: booking email uses the DJ's name", (kit.cta || "").startsWith("mailto:nova@example.com") && kit.cta.includes("DJ%20Nova"));
    check("epk: unsafe website link not shown", !kit.badLink);
    check("epk: photo uploaded", kit.photo === "data:image/jpeg;base64", kit.photo);
    check("epk: empty sections hidden", !kit.sections.includes("events") && !kit.sections.includes("testimonials"), kit.sections.join(","));

    await page.reload(); await page.waitForTimeout(200);
    check("epk: saved after reload", (await page.textContent(".dj-name")) === "DJ Nova" && !(await page.isVisible("#welcome")));

    await page.click("#editBtn");
    check("epk: editor reopens with saved values", (await page.inputValue("#fName")) === "DJ Nova" && (await page.locator("#mixFields .list-row").count()) === 2
      && (await page.locator("#genreChoices .choice.on").count()) === 2);
    await page.click("#mixFields .list-row:nth-child(2) .remove-btn");
    check("epk: removing a mix updates the page", (await page.locator("#kit .mix-item").count()) === 1);
    await page.fill("#fName", "<img src=x onerror=window.__xss=1>"); await page.waitForTimeout(200);
    check("epk: typed text can't run code", !(await page.evaluate(() => window.__xss)));
    await page.fill("#fName", "DJ Nova");
    await page.keyboard.press("Escape");
    check("epk: Escape closes the editor", !(await page.evaluate(() => document.body.classList.contains("editing"))));

    // Press kit goes into backups
    const home = await open("afroflow/index.html");
    check("epk: home page counts the press kit", (await home.page.textContent("#dataCounts")).includes("Press kit"));
    const [dl] = await Promise.all([home.page.waitForEvent("download"), home.page.click("#downloadBackupBtn")]);
    const backup = fs.readFileSync(await dl.path(), "utf8");
    check("epk: backup file includes the press kit", JSON.parse(backup).epk?.name === "DJ Nova");
    await home.page.evaluate(() => localStorage.clear()); await home.page.reload(); await home.page.waitForTimeout(200);
    await home.page.setInputFiles("#restoreFile", { name: "b.json", mimeType: "application/json", buffer: Buffer.from(backup) });
    await home.page.waitForTimeout(200);
    check("epk: restore preview mentions the press kit", (await home.page.textContent("#restoreSummary")).includes("press kit (DJ Nova)"));
    await home.page.click("#mergeBtn");
    await page.reload(); await page.waitForTimeout(200);
    check("epk: press kit back after restore", (await page.textContent(".dj-name")) === "DJ Nova" && (await page.locator("#kit .mix-item").count()) === 1);
    check("epk: no JS errors", errors.length === 0 && home.errors.length === 0, [...errors, ...home.errors].join(" | "));
    await page.evaluate(() => localStorage.clear());
    await page.close(); await home.page.close();
  }

  // ── Gig tracker ──
  {
    const { page, errors } = await open("afroflow/gig-tracker/index.html");
    await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(200);
    async function addGig(o) {
      await page.click("text=+ Add Gig");
      await page.fill("#gVenue", o.venue); await page.fill("#gCity", o.city || "Tel Aviv"); await page.fill("#gDate", o.date);
      await page.selectOption("#gStatus", o.status); await page.fill("#gPay", String(o.pay)); await page.selectOption("#gPayStatus", o.pay_status); if (o.deposit) await page.fill("#gDeposit", String(o.deposit));
      await page.click("#gigModalOverlay .btn-primary");
    }
    await addGig({ venue: "Club Lagos", date: "2026-09-01", status: "completed", pay: 1000, pay_status: "paid" });
    await addGig({ venue: "Haoman 17", date: "2026-09-10", status: "completed", pay: 2000, pay_status: "deposit", deposit: 500 });
    await addGig({ venue: "Future Fest", date: `${NEXT_YEAR}-01-10`, status: "confirmed", pay: 500, pay_status: "unpaid" });
    const stats = await page.evaluate(() => Object.fromEntries(["statTotal", "statCompleted", "statUpcoming", "statIncome", "statAvg", "statPending"].map(i => [i, document.getElementById(i).textContent])));
    check("gigs: 3 gigs added", stats.statTotal === "3", JSON.stringify(stats));
    check("gigs: earned = $1,500 (1000 paid + 500 deposit), pending = $2,000", stats.statIncome === "$1,500" && stats.statPending === "$2,000", `earned=${stats.statIncome} pending=${stats.statPending}`);
    check("gigs: upcoming = 1", stats.statUpcoming === "1", stats.statUpcoming);
    await page.selectOption("#filterYear", NEXT_YEAR);
    check("gigs: year filter", (await page.locator(".gig-card").count()) === 1);
    await page.selectOption("#filterYear", "");
    await page.locator(".gig-card", { hasText: "Future Fest" }).locator(".social").click();
    const cap = await page.textContent("#captionBox");
    check("gigs: caption for an UPCOMING gig doesn't talk about it in the past", !/Just locked in|were UNREAL|tonight/.test(cap), cap.split("\n").slice(0, 3).join(" / "));
    await page.click("#captionOverlay .caption-tab >> nth=2");
    const story = await page.textContent("#captionBox");
    check("gigs: story caption without a setlist", !story.includes("a full set."), story.match(/Played[^\n]*/)?.[0]);
    await page.keyboard.press("Escape");
    await page.locator(".gig-card", { hasText: "Club Lagos" }).locator(".social").click();
    check("gigs: caption for a PAST gig is a recap", (await page.textContent("#captionBox")).includes("Just locked in"));
    check("gigs: venue hashtag clean", (await page.textContent("#captionBox")).includes("#DJClubLagos #TelAviv"));
    await page.keyboard.press("Escape");
    await addGig({ venue: `Mike's "Rooftop"`, date: "2026-08-01", status: "completed", pay: 100, pay_status: "paid" });
    await page.locator(".gig-card", { hasText: "Rooftop" }).locator(".del").click(); await page.waitForTimeout(150);
    check(`gigs: delete works for venue with quotes`, await page.isVisible("#deleteOverlay"));
    await page.click("#deleteOverlay .btn-danger");
    check("gigs: gig actually deleted", (await page.locator(".gig-card", { hasText: "Rooftop" }).count()) === 0);
    check("gigs: no JS errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // ── Caption generator ──
  {
    const { page, errors } = await open("afroflow/caption-generator/index.html");
    await page.fill("#venue", "Club Lagos"); await page.fill("#city", "Tel Aviv"); await page.fill("#genre", "Afrobeats, Amapiano");
    await page.click("#platformChips .chip:has-text('Twitter')");
    await page.click("#generateBtn");
    const cards = await page.locator(".caption-card").count();
    check("captions: generates one per selected platform", cards === 2, `${cards}`);
    const tw = await page.textContent(".caption-card:has-text('Twitter') .char-count");
    check("captions: twitter within 280", !tw.includes("over"), tw);
    const tags = await page.locator(".hashtag-pill").count();
    check("captions: hashtags generated", tags > 0, `${tags} tags`);
    await page.fill("#city", "New York, NY"); await page.click("#generateBtn");
    const bad = await page.$$eval(".hashtag-pill", e => e.map(x => x.textContent).filter(t => /[^#\w]/.test(t)));
    check("captions: city hashtag is clean", bad.length === 0, bad.join(" "));
    await page.selectOption("#eventType", { index: 1 }); await page.fill("#date", `${NEXT_YEAR}-12-31`);
    await page.click("#generateBtn");
    const txt = await page.textContent(".caption-card .caption-body");
    check("captions: event type / date are used in caption", /Club Night|Dec|31/.test(txt), "fields collected but never used in templates");
    await page.click(".copy-btn >> nth=0"); await page.waitForTimeout(200);
    check("captions: copy", (await page.evaluate(() => navigator.clipboard.readText())).length > 10);
    check("captions: no JS errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  await browser.close();
  const fails = results.filter(r => !r.ok);
  console.log(`\n${results.length - fails.length}/${results.length} passed`);
  process.exit(fails.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
